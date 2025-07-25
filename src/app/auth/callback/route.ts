import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "No authorization code received"
      )}`
    );
  }

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: exchangeError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !user) {
      throw exchangeError || new Error("No user data received");
    }

    const provider = user.app_metadata?.provider || "email";
    const googleAvatarUrl = user.user_metadata?.avatar_url;
    let avatarUrl = null;

    // Check for existing profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Prepare profile data
    const profileData = {
      email: user.email!,
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      company_name: user.user_metadata?.company_name || null,
      email_verified: false,
      auth_provider: provider,
      avatar_url: avatarUrl || googleAvatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (!existingProfile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        ...profileData,
      });
    } else {
      await supabase.from("profiles").update(profileData).eq("id", user.id);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Authentication failed")}`
    );
  }
}
