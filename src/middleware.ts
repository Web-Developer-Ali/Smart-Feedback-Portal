import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and special paths
  if (
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public paths
  const publicPaths = ["/login", "/signup", "/auth", "/", "/otp-verification"];
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users trying to access protected routes
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const emailVerified = user?.user_metadata?.email_verified_byOTP === true;
  if (
    user &&
    emailVerified &&
    ["/login", "/signup", "/otp-verification" , "/"].includes(
      request.nextUrl.pathname
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
