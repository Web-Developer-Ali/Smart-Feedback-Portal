import { createTransport } from "nodemailer";
import { query } from "@/lib/db"; // <-- our pg helper

const transporter = createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

/**
 * Generates, stores, and emails a 6-digit OTP to the given user email.
 * Stores the OTP + expiration timestamp in the `users` table.
 * 
 * @param email The user's email address
 * @returns { success: true } or throws error
 */
export async function sendAndStoreOtp(email: string) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

  // 1. Store OTP + expiry in DB
  try {
    await query(
      `UPDATE users
       SET email_otp = $1, otp_expires_at = $2
       WHERE email = $3`,
      [otp, expiresAt.toISOString(), email]
    );
  } catch (dbError) {
    console.error("❌ Failed to store OTP:", dbError);
    throw new Error("Failed to update OTP in database.");
  }

  // 2. Send OTP via Nodemailer
  try {
    await transporter.sendMail({
      from: `"Smart Feedback Portal" <${process.env.GMAIL_USER}>`,
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
    });
  } catch (emailError) {
    console.error("❌ Failed to send OTP email:", emailError);
    throw new Error("Failed to send OTP email.");
  }

  return { success: true };
}

/**
 * Generates a 6-digit numeric OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
