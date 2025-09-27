// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = new Set([
  "/login",
  "/signup",
  "/auth/callback",
  "/",
  "/otp-verification",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static & API files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Get session token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET, // must be set in .env
  });

  const isPublicPath = publicPaths.has(pathname);

  // 1. Not logged in → redirect to /login (except public pages)
  if (!token) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 2. Handle email verification flow
  const isEmailUser = token.provider === "credentials";
  const isVerified =
    !isEmailUser || (token.email_verified_byOTP && token.email_verified_byOTP === true);

  // Special case: OAuth callback must always pass
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  if (isEmailUser && !isVerified && pathname !== "/otp-verification") {
    const redirectUrl = new URL("/otp-verification", request.url);
    redirectUrl.searchParams.set("email", token.email || "");
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Redirect logged-in users away from auth pages
  if (isVerified && isPublicPath && !pathname.startsWith("/auth/callback")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
