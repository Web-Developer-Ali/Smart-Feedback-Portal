"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendAndStoreOtp } from "@/lib/mail/send-and-store-otp"

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const companyName = formData.get("companyName") as string

  // Check if user already exists
  const { data: existingUser } = await supabase.from("profiles").select("email").eq("email", email).single()

  if (existingUser) {
    redirect(`/signup?error=${encodeURIComponent("An account with this email already exists. Please login instead.")}`)
  }

  // Step 1: Sign up with email + password (don't pass emailRedirectTo)
  const { error: authError} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
        email_verified_byOTP: false,
      }
    }
  })

  if (authError) {
    redirect(`/signup?error=${encodeURIComponent(authError.message)}`)
  }

  // Step 2: Create user profile with email_verified = false
  await supabase.from("profiles").upsert({
    email,
    full_name: fullName,
    company_name: companyName,
    email_verified: false
  })

// Step 3: Send verification email
const verification_Email = await sendAndStoreOtp(email)

if(!verification_Email.success) {
  redirect(`/signup?error=${encodeURIComponent("Failed to send verification email. Please try again.")}`)

}

  revalidatePath("/", "layout")
  redirect(`/otp-verification?email=${encodeURIComponent(email)}`)
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
   return { success: true, message: "You have been signed out successfully." }
}
