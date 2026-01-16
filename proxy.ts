/**
 * @fileoverview Next.js Proxy for Authentication and Security
 *
 * This proxy runs on every request and provides:
 *
 * Security Headers (Production):
 * - Content-Security-Policy: Prevents XSS and injection attacks
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-XSS-Protection: Legacy XSS filter
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts browser features
 *
 * Authentication:
 * - JWT token validation on protected routes
 * - Automatic redirect to login for unauthenticated users
 * - Cookie-based session management
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
const publicPaths = ['/login', '/api/auth/login', '/api/auth/register', '/api/auth/verify-email', '/api/auth/resend-code', '/api/payments/webhook']

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSP header
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;"
    )
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Redirect to dashboard if already logged in and valid token
    if (token && pathname === '/login') {
      const isValid = await verifyToken(token)
      if (isValid) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    return response
  }

  // Protect all other routes - validate JWT
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Validate JWT signature and expiry
  const isValid = await verifyToken(token)
  if (!isValid) {
    // Invalid or expired token - clear cookie and redirect
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    redirectResponse.cookies.delete('auth_token')
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
