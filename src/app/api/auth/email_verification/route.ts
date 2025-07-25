import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    // Fetch profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email_otp, otp_expires_at")
      .eq("email", email)
      .maybeSingle();
      console.log("profile:", profile, "error:", error);
    if (error || !profile) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { email_otp, otp_expires_at } = profile;

    const now = new Date();
    if (!email_otp || !otp_expires_at) {
      return NextResponse.json(
        { success: false, message: "No OTP found. Request a new code" },
        { status: 400 }
      );
    }

    if (email_otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 401 }
      );
    }

    if (new Date(otp_expires_at) < now) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 410 }
      );
    }

    // Update verification status in profile table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_otp: null,
        otp_expires_at: null,
      })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Verification update failed" },
        { status: 500 }
      );
    }

    // ✅ Fetch current session user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // ✅ Update metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          email_verified_byOTP: true,
        },
      });

      if (authError) {
        return NextResponse.json(
          { success: false, message: "Auth metadata update failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email verified and session updated",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
