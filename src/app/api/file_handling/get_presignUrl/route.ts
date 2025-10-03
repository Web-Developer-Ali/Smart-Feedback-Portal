import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

// S3 client configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Validation schema
const presignedUrlSchema = z.object({
  filename: z.string().min(1, "Filename is required")
                .max(255, "Filename too long")
                .refine(name => !name.includes('/') && !name.includes('\\'), "Invalid filename"),
  filetype: z.string().min(1, "File type is required")
                .refine(type => type.startsWith('image/') || type.startsWith('video/') || type.startsWith('application/') || type.startsWith('text/'), 
                        "Unsupported file type"),
  size: z.number().min(1, "File size must be positive")
                .max(100 * 1024 * 1024, "File size must not exceed 100MB")
});

// Allowed file types for security
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf', 
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain', 'text/csv',
  // Archives
  'application/zip', 'application/x-rar-compressed'
];

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  IMAGE: 20 * 1024 * 1024, // 20MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
  OTHER: 100 * 1024 * 1024 // 100MB
};

function getExpiryForFile(size: number, filetype: string) {
  // Larger files or sensitive files get shorter expiry
  if (size > 50 * 1024 * 1024) return 300; // 5 minutes for very large files
  if (size > 10 * 1024 * 1024) return 600; // 10 minutes for large files
  if (filetype.startsWith('image/')) return 1800; // 30 minutes for images
  return 900; // 15 minutes default
}

function getSizeLimitForFileType(filetype: string): number {
  if (filetype.startsWith('image/')) return FILE_SIZE_LIMITS.IMAGE;
  if (filetype.startsWith('application/') || filetype.startsWith('text/')) return FILE_SIZE_LIMITS.DOCUMENT;
  return FILE_SIZE_LIMITS.OTHER;
}

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and special characters
  return filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/\//g, '')   // Remove /
    .replace(/\\/g, '')   // Remove \
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 100); // Limit length
}

export async function POST(req: Request) {
  try {
    // Verify user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await req.json();
    const { filename, type:filetype, size } = body;
    // Validate input
    const validated = presignedUrlSchema.safeParse({
      filename,
      filetype,
      size
    });

    if (!validated.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validated.error.flatten() 
        },
        { status: 400 }
      );
    }

    // Check if file type is allowed
    if (!ALLOWED_FILE_TYPES.includes(filetype)) {
      return NextResponse.json(
        { 
          error: "File type not allowed",
          allowedTypes: ALLOWED_FILE_TYPES
        },
        { status: 400 }
      );
    }

    // Check file size against type-specific limits
    const sizeLimit = getSizeLimitForFileType(filetype);
    if (size > sizeLimit) {
      return NextResponse.json(
        { 
          error: `File too large for ${filetype.split('/')[0]} files`,
          maxSize: `${Math.round(sizeLimit / (1024 * 1024))}MB`,
          currentSize: `${Math.round(size / (1024 * 1024))}MB`
        },
        { status: 400 }
      );
    }

    // Sanitize filename and generate key
    const sanitizedFilename = sanitizeFilename(filename);
    const timestamp = Date.now();
    const key = `uploads/${userId}/${timestamp}-${sanitizedFilename}`;

    // Create S3 command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: filetype,
      ContentLength: size,
      Metadata: {
        'uploaded-by': userId,
        'original-filename': filename,
        'upload-timestamp': timestamp.toString()
      }
    });

    // Generate presigned URL
    const expiresIn = getExpiryForFile(size, filetype);
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
    return NextResponse.json({
      success: true,
      data: {
        url: uploadUrl,
        key: key,
        expiresIn: expiresIn,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }
    });

  } catch (error: unknown) {
    console.error("Presign URL Generation Error:", error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to generate upload URL";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}