import { createTransport } from "nodemailer"
import { createClient } from "@/lib/supabase/server"

const transporter = createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

/**
 * Generates, stores, and emails a 6-digit OTP to the given user email.
 * Also stores the OTP and expiration timestamp in the `profiles` table.
 * 
 * @param email The user's email address
 * @returns { success: true } or throws error
 */
export async function sendAndStoreOtp(email: string) {
  const supabase = await createClient()

  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min from now

  // 1. Store OTP + expiry in profile table
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      email_otp: otp,
      otp_expires_at: expiresAt.toISOString(),
    })
    .eq("email", email)

  if (updateError) {
    console.error("❌ Failed to store OTP:", updateError)
    throw new Error("Failed to update OTP in database.")
  }

  // 2. Send OTP via Nodemailer
  try {
    await transporter.sendMail({
      from: `"Smart Feedback Portal" ${process.env.GMAIL_USER}`,
      to: email,
      subject: "🔐 Your OTP Code",
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2>Email Verification</h2>
          <p>Use the following one-time password (OTP) to verify your email address:</p>
          <h1 style="font-size: 32px; color: #0f172a; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    })
  } catch (emailError) {
    console.error("❌ Failed to send OTP email:", emailError)
    throw new Error("Failed to send OTP email.")
  }

  return { success: true }
}

/**
 * Generates a 6-digit numeric OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}