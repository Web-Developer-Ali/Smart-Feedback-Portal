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

    // 2. Initialize Supabase client (single await)
    const supabase = await createClient();

    // 3. SECURELY validate user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { success: false, message: "Session verification failed" },
        { status: 401 }
      );
    }

    if (!user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 4. Verify email ownership
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized verification attempt" },
        { status: 403 }
      );
    }

    // 5. Fetch OTP data (single await)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email_otp, otp_expires_at, email_verified")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
      return NextResponse.json(
        { success: false, message: "Database error" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }

    // 6. Check verification status
    if (profile.email_verified) {
      return NextResponse.json(
        { success: false, message: "Email already verified" },
        { status: 409 }
      );
    }

    // 7. Validate OTP
    const now = new Date();
    if (!profile.email_otp || !profile.otp_expires_at) {
      return NextResponse.json(
        { success: false, message: "No active OTP found" },
        { status: 400 }
      );
    }

    if (profile.email_otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP code" },
        { status: 401 }
      );
    }

    if (new Date(profile.otp_expires_at) < now) {
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 410 }
      );
    }

    // 8. Execute atomic verification
    const updatePromises = [
      supabase.from("profiles").update({
        email_verified: true,
        email_otp: null,
        otp_expires_at: null,
        updated_at: now.toISOString(),
      }).eq("email", email),
      
      supabase.auth.updateUser({
        data: { 
          email_verified_byOTP: true,
          verification_timestamp: now.toISOString() 
        }
      })
    ];

    const [profileResult, authResult] = await Promise.all(updatePromises);

    // 9. Handle errors
    if (profileResult.error) {
      console.error("Profile update error:", profileResult.error);
      return NextResponse.json(
        { success: false, message: "Profile update failed" },
        { status: 500 }
      );
    }

    if (authResult.error) {
      console.error("Auth update error:", authResult.error);
      // Attempt rollback
      await supabase.from("profiles").update({
        email_verified: false,
        email_otp: profile.email_otp,
        otp_expires_at: profile.otp_expires_at
      }).eq("email", email);

      return NextResponse.json(
        { 
          success: false, 
          message: "Please log in again to complete verification" 
        },
        { status: 500 }
      );
    }

    // 10. Success response
    return NextResponse.json({
      success: true,
      message: "Email successfully verified",
      verified_at: now.toISOString()
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}