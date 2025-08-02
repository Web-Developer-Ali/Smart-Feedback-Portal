import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAndStoreOtp } from "@/lib/mail/send-and-store-otp";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    const { email, password, fullName, companyName } = await req.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Check if user already exists in profile table
    const { data: existingUser } = await (await supabase)
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Step 1: Create Auth user
    const { error: authError } = await (
      await supabase
    ).auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          email_verified_byOTP: false,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    // Step 2: Create profile row
    const { error: profileError } = await (await supabase)
      .from("profiles")
      .upsert({
        email,
        full_name: fullName,
        company_name: companyName,
        email_verified: false,
      });

    if (!profileError) {
      return NextResponse.json(
        { success: false, error: "Failed to create profile." },
        { status: 500 }
      );
    }

    // Step 3: Send OTP email
    const otpResult = await sendAndStoreOtp(email);

    if (!otpResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Signup successful. OTP sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
