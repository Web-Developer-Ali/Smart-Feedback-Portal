import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ProjectAccessEmailParams {
  email: string;
  senderName: string;
  projectName: string;
  projectDescription: string;
  portalLink: string;
}

async function sendProjectAccessEmail({
  email,
  senderName,
  projectName,
  projectDescription,
  portalLink
}: ProjectAccessEmailParams): Promise<{ success: true; messageId: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WorkSpan <noreply@workspan.io>',
      to: [email],
      subject: `🚀 Access Your Project Portal: ${projectName}`,
      html: generateProjectAccessEmailTemplate({
        senderName,
        projectName,
        projectDescription,
        portalLink
      }),
      tags: [
        {
          name: 'category',
          value: 'project_access'
        }
      ],
    });

    if (error) {
      console.error("❌ Failed to send project access email:", error);
      throw new Error(`Failed to send project access email: ${error.message}`);
    }

    console.log("✅ Project access email sent successfully. Message ID:", data?.id);
    return { success: true, messageId: data?.id || 'unknown' };

  } catch (error) {
    console.error("❌ Project access email error:", error);
    throw new Error("Failed to send project access email. Please try again.");
  }
}

function generateProjectAccessEmailTemplate({
  senderName,
  projectName,
  projectDescription,
  portalLink
}: Omit<ProjectAccessEmailParams, 'email'>): string {
  const truncatedDescription = projectDescription.length > 150 
    ? projectDescription.substring(0, 150) + '...' 
    : projectDescription;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Portal Access - WorkSpan</title>
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
            .project-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .project-name {
                font-size: 18px;
                font-weight: bold;
                color: #1e293b;
                margin-bottom: 8px;
            }
            .project-description {
                color: #64748b;
                line-height: 1.5;
            }
            .cta-button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: background-color 0.2s;
            }
            .cta-button:hover {
                background: #2563eb;
            }
            .footer { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #e2e8f0; 
                text-align: center; 
                color: #64748b; 
                font-size: 14px;
            }
            .features {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
                margin: 25px 0;
            }
            .feature-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #f0f9ff;
                border-radius: 6px;
                border-left: 4px solid #3b82f6;
            }
            .feature-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            .feature-text {
                color: #475569;
                font-size: 14px;
            }
            .signature {
                margin-top: 30px;
                color: #475569;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WorkSpan</div>
                <p style="margin: 5px 0 0 0; color: #64748b;">Project Portal Access</p>
            </div>
            
            <h2 style="color: #1e293b; margin-bottom: 5px;">Welcome to Your Project Portal!</h2>
            <p style="color: #475569; margin-bottom: 25px;">
                <strong>${senderName}</strong> has granted you access to monitor and manage your project on WorkSpan.
            </p>

            <div class="project-card">
                <div class="project-name">${projectName}</div>
                <div class="project-description">${truncatedDescription}</div>
            </div>

            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                        <strong>Track Progress</strong> - Monitor real-time project development and milestones
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">✅</div>
                    <div class="feature-text">
                        <strong>Approve Work</strong> - Review and approve milestone submissions
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">💬</div>
                    <div class="feature-text">
                        <strong>Provide Feedback</strong> - Share your thoughts and suggestions directly
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🔔</div>
                    <div class="feature-text">
                        <strong>Stay Updated</strong> - Get notified of important project updates
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${portalLink}" class="cta-button">
                    🚀 Access Project Portal
                </a>
                <p style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    This secure link will take you directly to your project dashboard
                </p>
            </div>

            <div style="background: #fef3c7; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>Note:</strong> This portal is specifically for <strong>${projectName}</strong>. 
                    You can access it anytime to check progress and communicate with your team.
                </p>
            </div>

            <div class="signature">
                <p>Best regards,<br><strong>The WorkSpan Team</strong></p>
            </div>

            <div class="footer">
                <p style="margin: 0;">© ${new Date().getFullYear()} WorkSpan. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #94a3b8;">
                    This is an automated message. Please do not reply to this email.<br>
                    <a href="https://www.workspan.io" style="color: #3b82f6; text-decoration: none;">Visit WorkSpan</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, senderName, projectName, projectDescription, portalLink } = await request.json();

    // Validate required fields
    if (!email || !senderName || !projectName || !portalLink) {
      return NextResponse.json(
        { error: 'Email, sender name, project name, and portal link are required' },
        { status: 400 }
      );
    }

    const result = await sendProjectAccessEmail({
      email,
      senderName,
      projectName,
      projectDescription: projectDescription || 'No description provided',
      portalLink
    });

    return NextResponse.json({
      success: true,
      message: 'Project portal access email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Send portal access email error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to send portal access email' 
      },
      { status: 500 }
    );
  }
}