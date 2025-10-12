// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = new Set([
  "/",
  "/login",
  "/signup",
  "/otp-verification",
  "/auth/callback",
  "/api/auth",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files & NextAuth API
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Get token with proper configuration
  let token;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      // Remove secureCookie for local development
      secureCookie: false, // Set to false for localhost
    });

    console.log(
      "Middleware token for",
      pathname,
      ":",
      token ? token.email : "Null"
    );
  } catch (error) {
    console.error("Token retrieval error:", error);
    token = null;
  }

  const isPublicPath = publicPaths.has(pathname);

  // Handle unauthenticated users
  if (!token) {
    if (!isPublicPath && !pathname.startsWith("/api/")) {
      console.log("Redirecting to login from:", pathname);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Handle authenticated users
  const isEmailUser = token.provider === "credentials";
  const isVerified = token.isVerified;

  // Allow OAuth callback
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  // Handle email verification
  if (isEmailUser && !isVerified && pathname !== "/otp-verification") {
    console.log("Redirecting to OTP verification for:", token.email);
    const redirectUrl = new URL("/otp-verification", request.url);
    redirectUrl.searchParams.set("email", token.email || "");
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isVerified && isPublicPath && pathname !== "/") {
    const authPages = ["/login", "/signup", "/otp-verification"];
    if (authPages.includes(pathname)) {
      console.log(
        "Redirecting authenticated user to dashboard from:",
        pathname
      );
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.well-known/|.*\\..*$).*)",
  ],
};
