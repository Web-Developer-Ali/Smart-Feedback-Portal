
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Proceed with login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const message = authError.message.includes("Invalid login credentials")
        ? "Invalid email or password"
        : authError.message.includes("Email not confirmed")
        ? "Please verify your email before logging in"
        : `Unexpected error: ${authError.message}`;

      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    // Step 2: Check if user exists

    if (!authData?.user) {
      return NextResponse.json(
        { success: false, message: "No user returned from authentication" },
        { status: 500 }
      );
    }

    // Step 3: check user metadata for email verification
    if (
      !authData.user.user_metadata?.email_verified_byOTP &&
      authData.user.app_metadata?.provider === "email"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
        },
        { status: 401 }
      );
    }

    // Step 4: Set cookies
    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
