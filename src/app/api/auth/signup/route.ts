import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendAndStoreOtp } from "@/lib/mail/send-and-store-otp";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, companyName } = await req.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Step 1: Check if user already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Step 2: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Insert into users table
    const userId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, company_name, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [userId, email, hashedPassword, fullName, companyName]
    );

    // Step 4: Send OTP email
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
