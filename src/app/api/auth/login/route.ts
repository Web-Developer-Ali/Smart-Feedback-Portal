import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const startTime = Date.now();
  const performanceMetrics: Record<string, number> = {};

  try {
    // 1. Parse input with validation
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 2. Optimized authentication with timing
    const authStart = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    performanceMetrics.authDuration = Date.now() - authStart;

    if (authError) {
      // Consolidated error handling
      let message = "Login failed";
      if (authError.message.includes("Invalid login credentials")) {
        message = "Invalid email or password";
      } else if (authError.message.includes("Email not confirmed")) {
        message = "Please verify your email before logging in";
      }

      console.error("Auth error:", {
        error: authError,
        email,
        duration: performanceMetrics.authDuration
      });

      return NextResponse.json({ 
        success: false, 
        message 
      }, { status: 401 });
    }

    // 3. Verify user exists (with RLS-safe check)
    if (!authData?.user) {
      console.error("No user returned from authentication", {
        email,
        duration: performanceMetrics.authDuration
      });
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      );
    }

    // 4. Efficient email verification check
    const verificationCheckStart = Date.now();
    const needsVerification = (
      !authData.user.user_metadata?.email_verified_byOTP &&
      authData.user.app_metadata?.provider === "email"
    );
    performanceMetrics.verificationCheckDuration = Date.now() - verificationCheckStart;

    if (needsVerification) {
      console.error("Email not verified", { email });
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
        },
        { status: 401 }
      );
    }

    // 5. Final response with performance metrics
    performanceMetrics.totalDuration = Date.now() - startTime;
    console.log("Login performance:", performanceMetrics);

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    console.error("Login system error:", {
      error,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    });
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}