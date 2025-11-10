// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public pages that don't require authentication
const publicPaths = new Set([
  "/",
  "/login",
  "/about",
  "/contact",
  "/help",
  "/docs",
  "/blog",
  "/features",
  "/pricing",
  "/signup",
  "/otp-verification",
  "/auth/callback",
]);

// Client-specific pages
const clientPages = new Set([
  "/client/client-communication",
  "/client/client-review", // dynamic routes handled below
  "/client/feedback",
  "/client/messages",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js internals, and NextAuth API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath =
    publicPaths.has(pathname) ||
    Array.from(clientPages).some((p) => pathname.startsWith(p));

  // Get NextAuth token
  let token = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production", // true in prod
    });
  } catch (error) {
    console.error("Token retrieval error:", error);
  }

  // Unauthenticated users trying to access protected pages
  if (!token && !isPublicPath && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users
  if (token) {
    const isEmailUser = token.provider === "credentials";
    const isVerified = token.isVerified;

    // Redirect unverified email users to OTP page
    if (isEmailUser && !isVerified && pathname !== "/otp-verification") {
      const redirectUrl = new URL("/otp-verification", request.url);
      redirectUrl.searchParams.set("email", token.email || "");
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from login/signup/OTP pages
    if (isVerified && publicPaths.has(pathname) && pathname !== "/") {
      const authPages = ["/login", "/signup", "/otp-verification"];
      if (authPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.well-known/|api/auth/|.*\\..*$).*)",
  ],
};
