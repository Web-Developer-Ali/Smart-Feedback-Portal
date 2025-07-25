// src/app/api/login/route.ts
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Check email verification status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email_verified")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    // Step 2: If not verified, delete user
    if (!profile?.email_verified) {
      // Fetch user ID from auth.users
      const { data: userData, error: userFetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
console.log(userFetchError, userData);
      if (userFetchError || !userData?.id) {
        return NextResponse.json(
          { success: false, message: "Failed to fetch user ID for deletion" },
          { status: 500 }
        );
      }

      // Delete user from auth.users (requires elevated RLS or service role)
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userData.id);

      // Also delete profile row
      await supabase.from("profiles").delete().eq("email", email);

      // Sign out to clear any session
      await signOut();

      return NextResponse.json(
        { success: false, unverified: true, message: "Unverified user deleted", email },
        { status: 403 }
      );
    }

    // Step 3: Proceed with login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const message = authError.message.includes("Invalid login credentials")
        ? "Invalid email or password"
        : authError.message.includes("Email not confirmed")
        ? "Please verify your email before logging in"
        : `Unexpected error: ${authError.message}`;

      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    const user = authData?.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No user returned from auth" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
