import { NextResponse } from "next/server"
import { sendAndStoreOtp } from "@/lib/mail/send-and-store-otp"

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 }
    )
  }

  try {
    // Reuse your existing function
    const result = await sendAndStoreOtp(email)
    if (!result.success) {
        return NextResponse.json(
            { success: false, error: "Failed to send OTP" },
            { status: 500 }
        )
    }
    return NextResponse.json({
      success: true,
      message: "New OTP sent successfully"
    })

  } catch (error) {
    console.error("Resend OTP error:", error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to resend OTP"
      },
      { status: 500 }
    )
  }
}