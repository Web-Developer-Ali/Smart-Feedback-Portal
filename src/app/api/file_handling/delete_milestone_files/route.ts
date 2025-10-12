import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { withTransaction } from "@/lib/db";
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/options";

// ======================
//  S3 CONFIGURATION
// ======================
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const schema = z.object({
  milestoneId: z.string().uuid(),
  force: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    // 1️⃣ Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { milestoneId, force } = parsed.data;

    // 2️⃣ Main transactional logic
    const result = await withTransaction(async (client) => {
      // --- Fetch milestone + project
      const milestoneRes = await client.query(
        `
        SELECT m.project_id, p.agency_id
        FROM milestones m
        JOIN project p ON p.id = m.project_id
        WHERE m.id = $1
        FOR SHARE
        `,
        [milestoneId]
      );

      if (milestoneRes.rowCount === 0) {
        throw new Error("Milestone not found");
      }

      const { project_id: projectId, agency_id: agencyId } = milestoneRes.rows[0];

      // --- Fetch attachments for this milestone
      const attachmentsRes = await client.query(
        `
        SELECT id, public_ids, file_names, uploaded_by, submission_notes
        FROM media_attachments
        WHERE milestone_id = $1
        FOR UPDATE
        `,
        [milestoneId]
      );

      if (attachmentsRes.rowCount === 0) {
        return {
          deletedKeys: [],
          deletedAttachmentIds: [],
          failedDeletes: [],
          projectId,
        };
      }

      const attachments = attachmentsRes.rows;

      // --- Authorization
      const uploaderIds = new Set(attachments.map((a) => a.uploaded_by));
      const allSameUploader = uploaderIds.size === 1 && uploaderIds.has(userId);
      const isOwner = agencyId === userId;

      if (!isOwner && !allSameUploader && !force) {
        throw new Error("Unauthorized: You cannot delete these attachments");
      }

      // --- Extract unique S3 keys
      const allKeys = attachments
        .flatMap((a) => a.public_ids ?? [])
        .filter((k): k is string => typeof k === "string" && k.trim().length > 0);

      const uniqueKeys = Array.from(new Set(allKeys));
      const deletedKeys: string[] = [];
      const failedDeletes: { key: string; error: string }[] = [];

      // --- Delete from S3 in batches
      const BATCH_SIZE = 1000;
      for (let i = 0; i < uniqueKeys.length; i += BATCH_SIZE) {
        const batch = uniqueKeys.slice(i, i + BATCH_SIZE);
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: false },
        });

        try {
          const res = await s3.send(deleteCommand);
          if (res.Deleted) {
            for (const item of res.Deleted) {
              if (item.Key) deletedKeys.push(item.Key);
            }
          }
          if (res.Errors) {
            for (const e of res.Errors) {
              failedDeletes.push({
                key: e?.Key || "unknown",
                error: e?.Message || "S3 error",
              });
            }
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          for (const key of batch) {
            failedDeletes.push({ key, error: errMsg || "Batch delete failed" });
          }
        }
      }

      // --- Delete from DB (only if there are no failed S3 deletes)
      const attachmentIds = attachments.map((a) => a.id);

      if (failedDeletes.length === 0) {
        await client.query(
          `DELETE FROM media_attachments WHERE id = ANY($1::uuid[])`,
          [attachmentIds]
        );

        // ✅ Update milestone status to 'in_progress'
        await client.query(
          `UPDATE milestones SET status = 'in_progress' WHERE id = $1`,
          [milestoneId]
        );
      }

      // --- Log project activity
      const description = `Deleted ${deletedKeys.length} file(s) from milestone ${
        milestoneId
      } by user ${userId}. ${
        failedDeletes.length ? `${failedDeletes.length} failed.` : ""
      }`;

      await client.query(
        `
        INSERT INTO project_activities
          (project_id, milestone_id, performed_by, activity_type, description, metadata)
        VALUES
          ($1, $2, $3, 'milestone_updated', $4, $5)
        `,
        [
          projectId,
          milestoneId,
          userId,
          description,
          {
            deleted_keys: deletedKeys,
            failed_deletes: failedDeletes,
            deleted_attachment_ids: attachmentIds,
          },
        ]
      );

      return {
        deletedKeys,
        failedDeletes,
        deletedAttachmentIds: attachmentIds,
        projectId,
      };
    });

    // 3️⃣ Success response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    console.error("❌ Delete milestone files error:", err);

    const message =
      err instanceof Error ? err.message : "Failed to delete milestone files";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
