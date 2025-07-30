import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 2. Authenticate and validate user session FIRST
    const { data: { user }, error: authError } = await (await supabase).auth.getUser();
    
    if (authError || !user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 3. Verify email ownership (prevent CSRF attacks)
    if (user.email !== email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized email verification attempt" },
        { status: 403 }
      );
    }

    // 4. Fetch OTP data from profile
    const { data: profile, error: profileError } = await (await supabase)
      .from("profiles")
      .select("email_otp, otp_expires_at, email_verified")
      .eq("email", email)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }

    // 5. Check if already verified
    if (profile.email_verified) {
      return NextResponse.json(
        { success: false, message: "Email already verified" },
        { status: 409 }
      );
    }

    // 6. Validate OTP
    const { email_otp, otp_expires_at } = profile;
    const now = new Date();

    if (!email_otp || !otp_expires_at) {
      return NextResponse.json(
        { success: false, message: "No active OTP found" },
        { status: 400 }
      );
    }

    if (email_otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code" },
        { status: 401 }
      );
    }

    if (new Date(otp_expires_at) < now) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 410 }
      );
    }

    // 7. Perform atomic updates (profile + auth metadata)
    const { error: updateError } = await (await supabase)
      .from("profiles")
      .update({
        email_verified: true,
        email_otp: null,
        otp_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }

    // 8. Update auth user metadata
    const { error: metadataError } = await (await supabase).auth.updateUser({
      data: { 
        email_verified_byOTP: true,
        verification_timestamp: new Date().toISOString() 
      }
    });

    if (metadataError) {
      // Rollback profile verification if auth update fails
      await (await supabase)
        .from("profiles")
        .update({
          email_verified: false,
          email_otp: email_otp, // Restore original OTP
          otp_expires_at: otp_expires_at,
        })
        .eq("email", email);

      return NextResponse.json(
        { 
          success: false, 
          message: "Verification completed but session update failed. Please log in again." 
        },
        { status: 500 }
      );
    }

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: "Email successfully verified",
      verified_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An unexpected error occurred during verification" 
      },
      { status: 500 }
    );
  }
}