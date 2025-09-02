// // app/api/project/submit_milestone/route.ts
// import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { v2 as cloudinary } from "cloudinary";
// import { v4 as uuidv4 } from "uuid";
// import { z } from "zod";

// // Validation schema
// const submitMilestoneSchema = z.object({
//   milestone_id: z.string().uuid("Valid milestone ID is required"),
//   project_id: z.string().uuid("Valid project ID is required"),
//   submission_notes: z.string().min(1, "Submission notes are required"),
//   files: z.array(z.instanceof(File)).optional().default([]),
// });

// export async function POST(request: Request) {
//   try {
//     const supabase = createClient();

//     // Verify user session
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();
    
//     if (authError || !user) {
//       return NextResponse.json(
//         { error: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     // Parse form data
//     const formData = await request.formData();
//     const milestone_id = formData.get("milestone_id") as string;
//     const project_id = formData.get("project_id") as string;
//     const submission_notes = formData.get("submission_notes") as string;
//     const files = formData.getAll("files") as File[];

//     // Validate input
//     const validated = submitMilestoneSchema.safeParse({
//       milestone_id,
//       project_id,
//       submission_notes,
//       files,
//     });

//     if (!validated.success) {
//       return NextResponse.json(
//         { 
//           error: "Validation failed", 
//           details: validated.error.flatten() 
//         },
//         { status: 400 }
//       );
//     }

//     // Get the milestone with project details
//     const { data: milestone, error: fetchError } = await supabase
//       .from("milestones")
//       .select(`
//         *,
//         project:project_id (
//           id,
//           agency_id,
//           status
//         )
//       `)
//       .eq("id", milestone_id)
//       .single();

//     if (fetchError) {
//       return NextResponse.json(
//         { error: "Milestone not found" },
//         { status: 404 }
//       );
//     }

//     // Check if user owns the project
//     if (milestone.project.agency_id !== user.id) {
//       return NextResponse.json(
//         { error: "Unauthorized access to milestone" },
//         { status: 403 }
//       );
//     }

//     // Validate that milestone is in "in_progress" status
//     if (milestone.status !== "in_progress") {
//       return NextResponse.json(
//         { 
//           error: "Milestone cannot be submitted",
//           details: `Milestone is currently in "${milestone.status}" status. Only "in_progress" milestones can be submitted.`,
//           current_status: milestone.status
//         },
//         { status: 400 }
//       );
//     }

//     // Upload files to Cloudinary if any
//     let public_ids: string[] = [];
//     let secure_urls: string[] = [];

//     if (files.length > 0) {
//       const uploadPromises = files.map(async (file) => {
//         try {
//           // Convert File to buffer
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);

//           // Upload to Cloudinary
//           const result = await new Promise<any>((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//               {
//                 folder: `projects/${project_id}/milestones/${milestone_id}`,
//                 resource_type: "auto",
//                 public_id: `${uuidv4()}-${file.name}`,
//               },
//               (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result);
//               }
//             );
//             uploadStream.end(buffer);
//           });

//           return {
//             public_id: result.public_id,
//             secure_url: result.secure_url,
//           };
//         } catch (error) {
//           console.error("File upload error:", error);
//           throw new Error(`Failed to upload file: ${file.name}`);
//         }
//       });

//       const uploadResults = await Promise.all(uploadPromises);
//       public_ids = uploadResults.map(result => result.public_id);
//       secure_urls = uploadResults.map(result => result.secure_url);
//     }

//     // Start transaction for multiple operations
//     let mediaAttachmentId: string | null = null;

//     // Save media attachments if files were uploaded
//     if (files.length > 0) {
//       const { data: mediaData, error: mediaError } = await supabase
//         .from("media_attachments")
//         .insert({
//           milestone_id,
//           project_id,
//           uploaded_by: user.id,
//           public_ids,
//           secure_urls,
//           submission_notes: submission_notes,
//         })
//         .select("id")
//         .single();

//       if (mediaError) {
//         console.error("Media attachment error:", mediaError);
//         // Don't fail the entire operation if media attachment fails
//       } else {
//         mediaAttachmentId = mediaData.id;
//       }
//     }

//     // Update milestone status to "submitted"
//     const { data: updatedMilestone, error: updateError } = await supabase
//       .from("milestones")
//       .update({
//         status: "submitted",
//         submitted_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//         submission_notes: submission_notes,
//         ...(mediaAttachmentId && { media_attachment_id: mediaAttachmentId }),
//       })
//       .eq("id", milestone_id)
//       .select()
//       .single();

//     if (updateError) {
//       throw new Error(`Milestone status update failed: ${updateError.message}`);
//     }

//     // Create activity log (if you have the table)
//     try {
//       await supabase
//         .from("project_activities")
//         .insert({
//           project_id,
//           milestone_id,
//           activity_type: "milestone_submitted",
//           description: `Milestone "${milestone.name}" submitted for review`,
//           performed_by: user.id,
//           metadata: {
//             submission_notes: submission_notes,
//             file_count: files.length,
//             media_attachment_id: mediaAttachmentId,
//           }
//         });
//     } catch (activityError) {
//       console.error("Activity log error:", activityError);
//       // Don't fail the entire operation if activity logging fails
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Milestone submitted successfully",
//       data: {
//         milestone: updatedMilestone,
//         files_uploaded: files.length,
//         media_attachment_id: mediaAttachmentId,
//       }
//     });
//   } catch (error: any) {
//     console.error("API Error:", error);

//     return NextResponse.json(
//       {
//         error: error.message || "Internal server error",
//         ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//       },
//       { status: 500 }
//     );
//   }
// }
 console.log("route.ts");