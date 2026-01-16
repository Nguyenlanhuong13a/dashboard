/**
 * @fileoverview Authentication Login Endpoint
 *
 * Handles user authentication with the following security measures:
 * - Rate limiting: 5 attempts per 15 minutes per IP address
 * - Password verification using bcrypt hashing
 * - JWT token generation with secure cookie storage
 * - Email verification requirement for new accounts
 *
 * @endpoint POST /api/auth/login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} User data on success, error message on failure
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth/config'
import { rateLimit, rateLimitConfigs, getClientIP } from '@/lib/rate-limit'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for login attempts
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`login_${clientIP}`, rateLimitConfigs.auth)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        password: true,
        emailVerified: true,
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate new verification code for unverified users
      const code = generateVerificationCode()
      const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Delete old verification codes and create new one
      await prisma.emailVerification.deleteMany({ where: { email } })
      await prisma.emailVerification.create({
        data: { email, code, expires }
      })

      // Try to send email
      const emailResult = await sendVerificationEmail(email, code)

      if (!emailResult.success) {
        return NextResponse.json(
          { error: emailResult.error || 'Failed to send verification email' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: 'Email not verified. Verification code sent.',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      )
    }

    // Create token and set cookie
    const { password: _, emailVerified: __, ...userWithoutPassword } = user
    const token = createToken(userWithoutPassword)
    await setAuthCookie(token)

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
