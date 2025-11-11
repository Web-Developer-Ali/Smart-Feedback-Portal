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

// Client-specific pages that should only be accessed by unauthenticated users
const clientPages = new Set([
  "/client/client-communication",
  "/client/client-review",
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

  // Check if the path is a client page
  const isClientPage = Array.from(clientPages).some((p) => pathname.startsWith(p)) || 
                      pathname.startsWith("/client/client-review/");

  // Get NextAuth token
  let token = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error("Token retrieval error:", error);
  }

  // Check if the path is public (excluding client pages)
  const isPublicPath = publicPaths.has(pathname) && !isClientPage;

  // 🔒 RESTRICTION: Authenticated users trying to access client pages
  if (token && isClientPage) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    
    // Add a header to show a message on the dashboard
    response.headers.set("x-auth-redirect", "client-page-restricted");
    
    // You can also set a cookie to show a toast message
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set("message", "client_access_restricted");
    
    return NextResponse.redirect(redirectUrl);
  }

  // Unauthenticated users trying to access protected pages (excluding client pages)
  if (!token && !isPublicPath && !pathname.startsWith("/api/") && !isClientPage) {
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