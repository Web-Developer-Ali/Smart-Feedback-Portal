import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { 
          success: false,
          message: "All fields are required: name, email, subject, and message." 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: "Please provide a valid email address." 
        },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'WorkSpan Contact <noreply@workspan.io>',
      to: ['alihamzashoaibahmed@gmail.com'],
      subject: `Contact Form: ${subject}`,
      replyTo: email,
      html: generateContactEmailTemplate({ name, email, subject, message }),
      tags: [
        {
          name: 'category',
          value: 'contact_form'
        }
      ],
    });

    if (error) {
      console.error("❌ Failed to send contact email:", error);
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to send message. Please try again later." 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you within 24 hours.",
      messageId: data?.id
    });

  } catch (error) {
    console.error("❌ Contact form API error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}

/**
 * Generates a professional contact form email template
 */
function generateContactEmailTemplate({
  name,
  email,
  subject,
  message
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - WorkSpan</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
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
            .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .field-label {
                font-weight: 600;
                color: #475569;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            .field-value {
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 16px;
            }
            .message-content {
                background: #f1f5f9;
                padding: 16px;
                border-radius: 6px;
                border-left: 4px solid #3b82f6;
                white-space: pre-wrap;
                font-family: inherit;
                line-height: 1.5;
            }
            .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #e2e8f0; 
                text-align: center; 
                color: #64748b; 
                font-size: 14px;
            }
            .action-button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 10px 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WorkSpan</div>
                <p style="margin: 5px 0 0 0; color: #64748b;">New Contact Form Submission</p>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 5px;">You have a new message!</h2>
            <p style="color: #475569; margin-bottom: 25px;">
                A visitor has submitted the contact form on WorkSpan.
            </p>

            <div class="info-card">
                <div class="field-label">From</div>
                <div class="field-value">
                    <strong>${name}</strong><br>
                    <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                </div>

                <div class="field-label">Subject</div>
                <div class="field-value">${subject}</div>

                <div class="field-label">Message</div>
                <div class="message-content">${message}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${email}" class="action-button">
                    📧 Reply to ${name}
                </a>
                <a href="https://workspan.io/dashboard" class="action-button" style="background: #64748b;">
                    📊 View Dashboard
                </a>
            </div>

            <div style="background: #f0f9ff; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0; color: #0369a1; font-size: 14px;">
                    <strong>💡 Tip:</strong> This message was sent via the WorkSpan contact form. 
                    The user expects a response within 24 hours.
                </p>
            </div>

            <div class="footer">
                <p style="margin: 0;">© ${new Date().getFullYear()} WorkSpan. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
                    This is an automated message from your website contact form.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}