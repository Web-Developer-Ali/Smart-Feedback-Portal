import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // 1. Skip ALL API routes explicitly
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // 2. Skip static files and well-known routes
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/.well-known/') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next()
  }

  // 3. Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        },
        remove(name: string) {
          request.cookies.delete(name)
          response.cookies.delete(name)
        },
      },
    }
  )

  let response = NextResponse.next()
  
  // 4. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  const emailVerified = user?.user_metadata?.email_verified_byOTP === true

  // 5. Public routes whitelist
  const publicRoutes = [
    '/', 
    '/login', 
    '/signup',
    '/otp-verification',
    '/auth/error' // Add any auth error routes
  ]

  // 6. Route protection logic
  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 7. Verified user redirection
  if (user && emailVerified && publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 8. OTP verification enforcement
  if (
    user &&
    !emailVerified &&
    user?.app_metadata?.provider === "email" &&
    !request.nextUrl.pathname.startsWith("/otp-verification")
  ) {
    const redirectUrl = new URL('/otp-verification', request.url)
    redirectUrl.searchParams.set('email', user.email || '')
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api routes (handled separately)
     * - static files (images, etc.)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}