// app/api/project/submit_milestone/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { z } from "zod";

// Validation schema
const submitMilestoneSchema = z.object({
  milestone_id: z.string().uuid("Valid milestone ID is required"),
  project_id: z.string().uuid("Valid project ID is required"),
  submission_notes: z.string().min(1, "Submission notes are required"),
  files: z.array(z.instanceof(File)).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verify user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const milestone_id = formData.get("milestone_id") as string;
    const project_id = formData.get("project_id") as string;
    const submission_notes = formData.get("submission_notes") as string;
    const files = formData.getAll("files") as File[];

    // Validate input
    const validated = submitMilestoneSchema.safeParse({
      milestone_id,
      project_id,
      submission_notes,
      files,
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

    // Get milestone with project details
    const { data: milestone, error: fetchError } = await supabase
      .from("milestones")
      .select(
        `
        *,
        project:project_id (
          id,
          agency_id,
          status
        )
      `
      )
      .eq("id", milestone_id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    // Ensure user owns the project
    if (milestone.project.agency_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to milestone" },
        { status: 403 }
      );
    }

    // Validate milestone status
    if (milestone.status !== "in_progress") {
      return NextResponse.json(
        {
          error: "Milestone cannot be submitted",
          details: `Milestone is currently in "${milestone.status}" status. Only "in_progress" milestones can be submitted.`,
          current_status: milestone.status,
        },
        { status: 400 }
      );
    }

    // Upload files to Cloudinary if any
    let public_ids: string[] = [];
    let secure_urls: string[] = [];

    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: `projects/${project_id}/milestones/${milestone_id}`,
                resource_type: "auto",
              },
              (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error("Unknown Cloudinary upload error"));
              }
            );
            uploadStream.end(buffer);
          });

          return {
            public_id: result.public_id,
            secure_url: result.secure_url,
          };
        } catch (err) {
          console.error("File upload error:", err);
          throw new Error(`Failed to upload file: ${file.name}`);
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      public_ids = uploadResults.map((r) => r.public_id);
      secure_urls = uploadResults.map((r) => r.secure_url);
    }

    // Save media attachments if files exist
    let mediaAttachmentId: string | null = null;

    if (files.length > 0) {
      const { data: mediaData, error: mediaError } = await supabase
        .from("media_attachments")
        .insert({
          milestone_id,
          project_id,
          uploaded_by: user.id,
          public_ids,
          secure_urls,
          submission_notes,
        })
        .select("id")
        .single();

      if (mediaError) {
        console.error("Media attachment error:", mediaError);
      } else {
        mediaAttachmentId = mediaData.id;
      }
    }

    // Update milestone status
    const { data: updatedMilestone, error: updateError } = await supabase
      .from("milestones")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submission_notes,
        ...(mediaAttachmentId && { media_attachment_id: mediaAttachmentId }),
      })
      .eq("id", milestone_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Milestone status update failed: ${updateError.message}`);
    }

    // Create activity log (optional)
    try {
      await supabase.from("project_activities").insert({
        project_id,
        milestone_id,
        activity_type: "milestone_submitted",
        description: `Milestone "${milestone.name}" submitted for review`,
        performed_by: user.id,
        metadata: {
          submission_notes,
          file_count: files.length,
          media_attachment_id: mediaAttachmentId,
        },
      });
    } catch (activityError) {
      console.error("Activity log error:", activityError);
    }

    return NextResponse.json({
      success: true,
      message: "Milestone submitted successfully",
      data: {
        milestone: updatedMilestone,
        files_uploaded: files.length,
        media_attachment_id: mediaAttachmentId,
      },
    });
  } catch (error: unknown) {
    console.error("API Error:", error);

    let message = "Internal server error";
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    }

    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" && stack ? { stack } : {}),
      },
      { status: 500 }
    );
  }
}
