import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createToken, setAuthCookie } from '@/lib/auth/config'
import crypto from 'crypto'

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Sanitize code - only digits, 6 characters
    const sanitizedCode = code.toString().replace(/\D/g, '').slice(0, 6)
    if (sanitizedCode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    // Find verification record
    const verification = await prisma.emailVerification.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'No verification code found. Please register again.' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > verification.expires) {
      await prisma.emailVerification.delete({ where: { id: verification.id } })
      return NextResponse.json(
        { error: 'Verification code expired. Please register again.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (verification.attempts >= MAX_ATTEMPTS) {
      await prisma.emailVerification.delete({ where: { id: verification.id } })
      // Also delete unverified user
      await prisma.user.deleteMany({
        where: { email, emailVerified: null }
      })
      return NextResponse.json(
        { error: 'Too many failed attempts. Please register again.' },
        { status: 400 }
      )
    }

    // Verify code with timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(sanitizedCode.padEnd(6, '0')),
      Buffer.from(verification.code.padEnd(6, '0'))
    )

    if (!isValid) {
      // Increment attempts
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } }
      })
      const remaining = MAX_ATTEMPTS - verification.attempts - 1
      return NextResponse.json(
        { error: `Invalid code. ${remaining} attempts remaining.` },
        { status: 400 }
      )
    }

    // Code is valid - verify user's email
    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
      }
    })

    // Delete verification record
    await prisma.emailVerification.delete({ where: { id: verification.id } })

    // Create token and set cookie
    const token = createToken(user)
    await setAuthCookie(token)

    return NextResponse.json({ user, verified: true })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
