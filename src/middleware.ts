import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and special paths
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/.well-known/") ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: Partial<ResponseCookie>) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        },
        remove(name: string) {
          request.cookies.delete(name);
          response.cookies.delete(name);
        },
      },
    }
  );

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Strict public paths definition (only exact matches)
  const publicPaths = new Set([
    "/login",
    "/signup",
    "/auth/callback",
    "/",
    "/otp-verification"
  ]);

  const isPublicPath = publicPaths.has(request.nextUrl.pathname);

  // 1. Handle unauthenticated users
  if (!user) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // 2. Determine verification status
  const isEmailUser = user.app_metadata?.provider === "email";
  const isVerified = !isEmailUser || user.user_metadata?.email_verified_byOTP === true;

  // 3. Special case: OAuth callback must always complete
  if (request.nextUrl.pathname === "/auth/callback") {
    return response;
  }

  // 4. Strict verification enforcement for email users
  if (isEmailUser && !isVerified && request.nextUrl.pathname !== "/otp-verification") {
      const redirectUrl = new URL('/otp-verification', request.url);
      redirectUrl.searchParams.set('email', user.email || '');
      return NextResponse.redirect(redirectUrl);
  }

  // 5. Redirect verified/social users away from auth pages
  if (isVerified && isPublicPath && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except:
    "/((?!api/|_next/static|_next/image|favicon.ico|.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};