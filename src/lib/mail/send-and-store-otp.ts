import { Resend } from 'resend';
import { query } from "@/lib/db";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generates, stores, and emails a 6-digit OTP to the given user email.
 * Stores the OTP + expiration timestamp in the `users` table.
 * 
 * @param email The user's email address
 * @returns { success: true, messageId: string } or throws error
 */
export async function sendAndStoreOtp(email: string): Promise<{ success: true; messageId: string }> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

  // 1. Store OTP + expiry in DB
  try {
    const result = await query(
      `UPDATE users 
       SET email_otp = $1, otp_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE email = $3
       RETURNING id`,
      [otp, expiresAt.toISOString(), email]
    );

    // Check if user was found and updated
    if (result.rows.length === 0) {
      throw new Error("User not found with the provided email.");
    }
  } catch (dbError) {
    console.error("❌ Failed to store OTP:", dbError);
    throw new Error("Failed to update OTP in database.");
  }

  // 2. Send OTP via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: 'WorkSpan <noreply@workspan.io>',
      to: [email],
      subject: "🔐 Your Verification Code - WorkSpan",
      html: generateEmailTemplate(otp),
      tags: [
        {
          name: 'category',
          value: 'otp'
        }
      ],
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }

    console.log("✅ OTP email sent successfully. Message ID:", data?.id);
    return { success: true, messageId: data?.id || 'unknown' };

  } catch (emailError) {
    console.error("❌ Failed to send OTP email:", emailError);
    throw new Error("Failed to send OTP email. Please try again.");
  }
}

/**
 * Verifies the OTP for a given email
 */
export async function verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await query(
      `SELECT email_otp, otp_expires_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "User not found." };
    }

    const user = result.rows[0];
    const now = new Date();

    // Check if OTP exists and is not expired
    if (!user.email_otp || !user.otp_expires_at) {
      return { success: false, message: "OTP not found or expired." };
    }

    if (new Date(user.otp_expires_at) < now) {
      return { success: false, message: "OTP has expired." };
    }

    if (user.email_otp !== otp) {
      return { success: false, message: "Invalid OTP." };
    }

    // Clear OTP after successful verification
    await query(
      `UPDATE users 
       SET email_otp = NULL, otp_expires_at = NULL, email_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE email = $1`,
      [email]
    );

    return { success: true, message: "Email verified successfully." };

  } catch (error) {
    console.error("❌ OTP verification error:", error);
    throw new Error("Failed to verify OTP.");
  }
}

/**
 * Resends OTP to the user
 */
export async function resendOtp(email: string): Promise<{ success: true; messageId: string }> {
  try {
    // First check if user exists
    const userResult = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found.");
    }

    // Use the same function to send new OTP
    return await sendAndStoreOtp(email);
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    throw new Error("Failed to resend OTP.");
  }
}

/**
 * Generates a professional email template for WorkSpan
 */
function generateEmailTemplate(otp: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - WorkSpan</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 500px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header { 
                text-align: center; 
                border-bottom: 2px solid #3b82f6; 
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 10px;
            }
            .otp-container { 
                text-align: center; 
                margin: 30px 0; 
                padding: 30px;
                background: #f0f9ff;
                border-radius: 8px;
                border: 1px solid #bae6fd;
            }
            .otp-code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #1e40af; 
                letter-spacing: 8px; 
                margin: 20px 0;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            }
            .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #e2e8f0; 
                text-align: center; 
                color: #64748b; 
                font-size: 14px;
            }
            .warning {
                background: #fef3c7;
                padding: 12px 16px;
                border-radius: 6px;
                border-left: 4px solid #f59e0b;
                margin: 20px 0;
                font-size: 14px;
            }
            .support {
                background: #f0fdf4;
                padding: 12px 16px;
                border-radius: 6px;
                border-left: 4px solid #22c55e;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WorkSpan</div>
                <p style="margin: 5px 0 0 0; color: #64748b;">Email Verification Required</p>
            </div>
            
            <h2 style="color: #1e293b;">Hello,</h2>
            <p>To complete your verification, please use the following one-time password (OTP):</p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #475569; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>

            <div class="warning">
                <strong>🔒 Security Notice:</strong> For your protection, never share this code with anyone. WorkSpan team will never ask for your verification code.
            </div>

            <div class="support">
                <strong>💁 Need help?</strong> If you didn't request this verification, please ignore this email or contact our support team at <a href="mailto:support@workspan.io" style="color: #3b82f6;">support@workspan.io</a>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">© ${new Date().getFullYear()} WorkSpan. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
                    This is an automated message, please do not reply to this email.<br>
                    <a href="https://www.workspan.io" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates a 6-digit numeric OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}