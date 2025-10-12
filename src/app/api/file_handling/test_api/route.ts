// app/api/test/all-data/route.ts
import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";

export async function GET() {
  try {
    const data = await withTransaction(async (client) => {
      // Fetch data from all tables
      const projectData = await client.query("SELECT * FROM project");
      const milestonesData = await client.query("SELECT * FROM milestones");
      const mediaAttachmentsData = await client.query(
        "SELECT * FROM media_attachments"
      );
      const reviewsData = await client.query("SELECT * FROM reviews");
      const projectActivitiesData = await client.query(
        "SELECT * FROM project_activities"
      );

      // If you have users table
      let usersData;
      try {
        usersData = await client.query(
          "SELECT id, name, email, created_at FROM users"
        );
      } catch {
        usersData = { rows: [], error: "Users table not available" };
      }

      return {
        project: projectData.rows,
        milestones: milestonesData.rows,
        media_attachments: mediaAttachmentsData.rows,
        reviews: reviewsData.rows,
        project_activities: projectActivitiesData.rows,
        users: usersData.rows || usersData,
      };
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: unknown) {
    console.error("Test API Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
