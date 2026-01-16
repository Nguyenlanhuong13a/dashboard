import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/config'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Rate limit: max 3 verification attempts per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentAttempts = await prisma.emailVerification.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Try again later.' },
        { status: 429 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with unverified email
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    })

    // Generate and save verification code
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete old verification codes for this email
    await prisma.emailVerification.deleteMany({
      where: { email }
    })

    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expires,
      }
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, code)

    if (!emailResult.success) {
      // Clean up and fail
      await prisma.user.delete({ where: { id: user.id } })
      await prisma.emailVerification.deleteMany({ where: { email } })
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email. Please check email configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      requiresVerification: true,
      email: user.email,
      message: 'Verification code sent to your email'
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to register', details: message },
      { status: 500 }
    )
  }
}
