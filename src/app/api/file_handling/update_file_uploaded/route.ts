import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { recordFilesSchema } from "@/lib/validations/update_file_uploaded";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { milestoneId, files = [] } = body; // Remove submissionNotes from destructuring
    const trimmedNotes = body.submissionNotes?.trim();

    if (!trimmedNotes || trimmedNotes.length < 5) {
      return NextResponse.json(
        {
          error:
            "Submission notes are required and must be at least 5 characters",
          details: {
            fieldErrors: {
              submissionNotes: [
                "Submission notes are required and must be at least 5 characters",
              ],
            },
          },
        },
        { status: 400 }
      );
    }

    // Clean files array by removing submissionNotes from each file object
    const cleanedFiles = files.map(
      (file: {
        submissionNotes?: string;
        key: string;
        name: string;
        size: number;
        type: string;
        lastModified?: number;
      }) => {
        const { ...rest } = file;
        return rest;
      }
    );

    // Validate input
    const validated = recordFilesSchema.safeParse({
      milestoneId,
      files: cleanedFiles,
      submissionNotes: trimmedNotes,
    });

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Verify user session using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Use transaction wrapper
    const result = await withTransaction(async (client) => {
      // Verify milestone exists and belongs to a project that the user owns
      const milestoneResult = await client.query(
        `SELECT 
           m.*, 
           p.agency_id, 
           p.name as project_name,
           p.client_email
         FROM milestones m
         JOIN project p ON m.project_id = p.id
         WHERE m.id = $1`,
        [milestoneId]
      );

      if (!milestoneResult.rows.length) {
        throw new Error("Milestone not found");
      }

      const milestone = milestoneResult.rows[0];
      const projectId = milestone.project_id;

      // STRONG AUTHORIZATION: Check if user is the agency owner of the project
      if (milestone.agency_id !== userId) {
        throw new Error(
          "Unauthorized access to milestone - you must be the agency owner"
        );
      }

      // Extract file data from validated input
      const fileKeys = validated.data.files.map((file) => file.key);
      const fileNames = validated.data.files.map((file) => file.name);
      const totalSize = validated.data.files.reduce(
        (sum, file) => sum + file.size,
        0
      );

      let mediaAttachment = null;
      let previousFileCount = 0;
      let currentFileCount = 0;
      let isUpdate = false;
      let milestoneStatusUpdated = false;

      // Only process files if there are any
      if (validated.data.files.length > 0) {
        // Check if there's an existing media attachment for this milestone
        const existingMediaResult = await client.query(
          `SELECT id, public_ids, file_names 
           FROM media_attachments 
           WHERE milestone_id = $1 AND project_id = $2`,
          [milestoneId, projectId]
        );

        if (existingMediaResult.rows.length > 0) {
          // Update existing record by appending to arrays
          isUpdate = true;
          const existing = existingMediaResult.rows[0];
          previousFileCount = existing.public_ids?.length || 0;

          const updatedPublicIds = [
            ...(existing.public_ids || []),
            ...fileKeys,
          ];
          const updatedFileNames = [
            ...(existing.file_names || []),
            ...fileNames,
          ];
          currentFileCount = updatedPublicIds.length;

          const updateResult = await client.query(
            `UPDATE media_attachments 
             SET public_ids = $1, file_names = $2, submission_notes = $3, uploaded_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [
              updatedPublicIds,
              updatedFileNames,
              validated.data.submissionNotes,
              existing.id,
            ]
          );

          if (!updateResult.rows.length) {
            throw new Error("Failed to update media attachment");
          }

          mediaAttachment = updateResult.rows[0];
        } else {
          // Create new media attachment record
          const insertResult = await client.query(
            `INSERT INTO media_attachments (
              milestone_id, project_id, uploaded_by, public_ids, file_names, submission_notes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
              milestoneId,
              projectId,
              userId,
              fileKeys,
              fileNames,
              validated.data.submissionNotes,
            ]
          );

          if (!insertResult.rows.length) {
            throw new Error("Failed to create media attachment");
          }

          mediaAttachment = insertResult.rows[0];
          currentFileCount = fileKeys.length;
          previousFileCount = 0;
        }
      } else {
        // No files to process, but we still need to create/update a media_attachment record for the submission notes
        const existingMediaResult = await client.query(
          `SELECT id, public_ids, file_names 
           FROM media_attachments 
           WHERE milestone_id = $1 AND project_id = $2`,
          [milestoneId, projectId]
        );

        if (existingMediaResult.rows.length > 0) {
          // Update existing record with new submission notes
          isUpdate = true;
          const existing = existingMediaResult.rows[0];
          currentFileCount = existing.public_ids?.length || 0;

          const updateResult = await client.query(
            `UPDATE media_attachments 
             SET submission_notes = $1, uploaded_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [validated.data.submissionNotes, existing.id]
          );

          if (!updateResult.rows.length) {
            throw new Error("Failed to update media attachment");
          }

          mediaAttachment = updateResult.rows[0];
        } else {
          // Create new media attachment record with only submission notes (no files)
          const insertResult = await client.query(
            `INSERT INTO media_attachments (
              milestone_id, project_id, uploaded_by, public_ids, file_names, submission_notes
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
              milestoneId,
              projectId,
              userId,
              [],
              [],
              validated.data.submissionNotes,
            ]
          );

          if (!insertResult.rows.length) {
            throw new Error("Failed to create media attachment");
          }

          mediaAttachment = insertResult.rows[0];
          currentFileCount = 0;
        }
      }

      // Update milestone status from "in_progress" to "submitted" if it's currently "in_progress"
      if (milestone.status === "in_progress") {
        const updateMilestoneResult = await client.query(
          `UPDATE milestones 
           SET status = 'submitted', submitted_at = NOW()
           WHERE id = $1 AND status = 'in_progress'
           RETURNING id, status`,
          [milestoneId]
        );

        if (updateMilestoneResult.rows.length > 0) {
          milestoneStatusUpdated = true;
        }
      }

      // Enhanced activity logging
      const fileCount = validated.data.files.length;
      let activityDescription = "";
      let activityType = "milestone_submitted";

      if (milestoneStatusUpdated && fileCount > 0) {
        activityDescription = `Milestone submitted with ${fileCount} files: "${milestone.title}"`;
      } else if (milestoneStatusUpdated && fileCount === 0) {
        activityDescription = `Milestone submitted without files: "${milestone.title}"`;
      } else if (fileCount > 0 && isUpdate) {
        activityDescription = `${fileCount} files added to milestone "${milestone.title}" (Total: ${currentFileCount} files)`;
        activityType = "file_uploaded";
      } else if (fileCount > 0) {
        activityDescription = `${fileCount} files uploaded to milestone "${milestone.title}"`;
        activityType = "file_uploaded";
      } else {
        activityDescription = `Milestone updated: "${milestone.title}"`;
        activityType = "milestone_updated";
      }

      const activityMetadata: Record<string, unknown> = {
        project_name: milestone.project_name,
        milestone_title: milestone.title,
        submission_notes: validated.data.submissionNotes,
        milestone_status_updated: milestoneStatusUpdated,
        previous_milestone_status: milestone.status,
        new_milestone_status: milestoneStatusUpdated
          ? "submitted"
          : milestone.status,
        has_files: fileCount > 0,
      };

      // Add file information only if files were processed
      if (fileCount > 0 && mediaAttachment) {
        activityMetadata.media_attachment_id = mediaAttachment.id;
        activityMetadata.file_count = currentFileCount;
        activityMetadata.files_processed = fileCount;
        activityMetadata.is_update = isUpdate;

        activityMetadata.current_batch = {
          file_count: fileCount,
          total_size: totalSize,
          files: validated.data.files.map((file) => ({
            name: file.name,
            key: file.key,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          })),
        };

        if (isUpdate) {
          activityMetadata.previous_file_count = previousFileCount;
        }
      }

      const activityResult = await client.query(
        `INSERT INTO project_activities (
          project_id, milestone_id, activity_type, description, performed_by, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id`,
        [
          projectId,
          milestoneId,
          activityType,
          activityDescription,
          userId,
          JSON.stringify(activityMetadata),
        ]
      );

      return {
        mediaAttachment,
        activityLogged: activityResult.rows.length > 0,
        isUpdate,
        fileCount: currentFileCount,
        filesProcessed: fileCount,
        totalFiles: currentFileCount,
        milestoneStatusUpdated,
        previousMilestoneStatus: milestone.status,
        newMilestoneStatus: milestoneStatusUpdated
          ? "submitted"
          : milestone.status,
        hasFiles: fileCount > 0,
      };
    });

    // Generate appropriate success message
    let successMessage = "";
    if (result.milestoneStatusUpdated && result.hasFiles) {
      successMessage = `Milestone submitted successfully with ${result.filesProcessed} files`;
    } else if (result.milestoneStatusUpdated && !result.hasFiles) {
      successMessage = `Milestone submitted successfully without files`;
    } else if (result.hasFiles && result.isUpdate) {
      successMessage = `${result.filesProcessed} files added successfully (Total: ${result.totalFiles} files)`;
    } else if (result.hasFiles) {
      successMessage = `${result.filesProcessed} files uploaded successfully`;
    } else {
      successMessage = `Milestone updated successfully`;
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
    });
  } catch (error: unknown) {
    console.error("Record Media Attachment API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    // Handle specific error types with appropriate status codes
    let statusCode = 500;
    if (errorMessage === "Authentication required") statusCode = 401;
    else if (errorMessage.includes("Unauthorized access to milestone"))
      statusCode = 403;
    else if (errorMessage.includes("not found")) statusCode = 404;
    else if (errorMessage.includes("Validation failed")) statusCode = 400;

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: statusCode }
    );
  }
}
