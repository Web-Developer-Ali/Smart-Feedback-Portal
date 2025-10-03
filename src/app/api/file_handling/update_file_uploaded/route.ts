import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { withTransaction } from "@/lib/db";
import { z } from "zod";

// Validation schema for multiple files
const recordFilesSchema = z.object({
  milestoneId: z.string().uuid(),
  files: z.array(z.object({
    key: z.string().min(1, "File key is required"),
    name: z.string().min(1, "Filename is required"),
    size: z.number().min(1, "File size must be positive"),
    type: z.string().min(1, "File type is required"),
    lastModified: z.number().optional(),
  })).min(1, "At least one file is required"),
  submissionNotes: z.string()
    .min(5, "Submission notes must be at least 5 characters")
    .max(500, "Submission notes must not exceed 500 characters")
    .optional()
    .default("Files uploaded via bulk upload"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { milestoneId, files } = body;
    
    // Extract submissionNotes from the first file if it exists there, otherwise use default
    // Also handle case where submissionNotes might be at root level
    const submissionNotes = body.submissionNotes || files?.[0]?.submissionNotes || "Files uploaded via bulk upload";
    
    // Clean files array by removing submissionNotes from each file object
    const cleanedFiles = files.map((file: { submissionNotes?: string; key: string; name: string; size: number; type: string; lastModified?: number }) => {
      // Remove submissionNotes from each file object
      const { submissionNotes, ...rest } = file;
      return rest;
    });
    // Validate input
    const validated = recordFilesSchema.safeParse({
      milestoneId,
      files: cleanedFiles,
      submissionNotes: submissionNotes
    });

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
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
      // Verify milestone exists and belongs to the project, and user has access
      const milestoneResult = await client.query(
        `SELECT m.*, p.agency_id, p.client_email, p.name as project_name
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

      // Check authorization - user must be either agency owner or client
      if (milestone.agency_id !== userId && milestone.client_email !== session.user?.email) {
        throw new Error("Unauthorized access to milestone");
      }

      // Extract file data from validated input
      const fileKeys = validated.data.files.map(file => file.key);
      const fileNames = validated.data.files.map(file => file.name);
      const totalSize = validated.data.files.reduce((sum, file) => sum + file.size, 0);

      // Check if there's an existing media attachment for this milestone
      const existingMediaResult = await client.query(
        `SELECT id, public_ids, file_names 
         FROM media_attachments 
         WHERE milestone_id = $1 AND project_id = $2`,
        [milestoneId, projectId]
      );

      let mediaAttachment;
      let previousFileCount = 0;
      let currentFileCount = 0;
      let isUpdate = false;
      let milestoneStatusUpdated = false;
      
      if (existingMediaResult.rows.length > 0) {
        // Update existing record by appending to arrays
        isUpdate = true;
        const existing = existingMediaResult.rows[0];
        previousFileCount = existing.public_ids?.length || 0;
        
        const updatedPublicIds = [...(existing.public_ids || []), ...fileKeys];
        const updatedFileNames = [...(existing.file_names || []), ...fileNames];
        currentFileCount = updatedPublicIds.length;

        const updateResult = await client.query(
          `UPDATE media_attachments 
           SET public_ids = $1, file_names = $2, submission_notes = $3, uploaded_at = NOW()
           WHERE id = $4
           RETURNING *`,
          [updatedPublicIds, updatedFileNames, validated.data.submissionNotes, existing.id]
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
          [milestoneId, projectId, userId, fileKeys, fileNames, validated.data.submissionNotes]
        );

        if (!insertResult.rows.length) {
          throw new Error("Failed to create media attachment");
        }

        mediaAttachment = insertResult.rows[0];
        currentFileCount = fileKeys.length;
        previousFileCount = 0;
      }

      // Update milestone status from "in_progress" to "submitted" if it's currently "in_progress"
      if (milestone.status === 'in_progress') {
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

      // Enhanced activity logging with all file information
      const fileCount = validated.data.files.length;
      const fileList = validated.data.files.map(f => f.name).join(', ');
      
      let activityDescription = '';
      let activityType = 'file_uploaded';

      if (milestoneStatusUpdated) {
        activityDescription = `${fileCount} files uploaded and milestone submitted: "${milestone.title}"`;
        activityType = 'milestone_submitted';
      } else if (isUpdate) {
        activityDescription = `${fileCount} files added to milestone "${milestone.title}" (Total: ${currentFileCount} files)`;
      } else {
        activityDescription = `${fileCount} files uploaded to milestone "${milestone.title}"`;
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
          JSON.stringify({
            media_attachment_id: mediaAttachment.id,
            // Current batch info
            current_batch: {
              file_count: fileCount,
              total_size: totalSize,
              files: validated.data.files.map(file => ({
                name: file.name,
                key: file.key,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
              }))
            },
            // All files info
            all_files: mediaAttachment.file_names.map((name: string, index: number) => ({
              name: name,
              key: mediaAttachment.public_ids[index],
              is_new: index >= previousFileCount
            })),
            project_name: milestone.project_name,
            milestone_title: milestone.title,
            submission_notes: validated.data.submissionNotes,
            file_count: currentFileCount,
            previous_file_count: previousFileCount,
            is_update: isUpdate,
            batch_size: fileCount,
            milestone_status_updated: milestoneStatusUpdated,
            previous_milestone_status: milestone.status,
            new_milestone_status: milestoneStatusUpdated ? 'submitted' : milestone.status
          })
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
        newMilestoneStatus: milestoneStatusUpdated ? 'submitted' : milestone.status
      };
    });

    return NextResponse.json({
      success: true,
      message: result.milestoneStatusUpdated 
        ? `${result.filesProcessed} files uploaded successfully and milestone submitted (Total: ${result.totalFiles} files)`
        : result.isUpdate 
          ? `${result.filesProcessed} files added successfully (Total: ${result.totalFiles} files)` 
          : `${result.filesProcessed} files uploaded successfully`,
      data: {
        filesProcessed: result.filesProcessed,
        totalFiles: result.totalFiles,
        isUpdate: result.isUpdate,
        milestoneStatusUpdated: result.milestoneStatusUpdated,
        previousMilestoneStatus: result.previousMilestoneStatus,
        newMilestoneStatus: result.newMilestoneStatus
      }
    });

  } catch (error: unknown) {
    console.error("Record Media Attachment API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    
    // Handle specific error types with appropriate status codes
    let statusCode = 500;
    if (errorMessage === "Authentication required") statusCode = 401;
    else if (errorMessage === "Unauthorized access to milestone") statusCode = 403;
    else if (errorMessage.includes("not found")) statusCode = 404;
    else if (errorMessage.includes("Validation failed")) statusCode = 400;

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: statusCode }
    );
  }
}