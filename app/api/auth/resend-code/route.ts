import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists and is unverified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    // Rate limit: max 3 codes per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCodes = await prisma.emailVerification.count({
      where: {
        email,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentCodes >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      )
    }

    // Generate new code
    const code = generateVerificationCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    // Delete old codes
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

    // Send email
    const result = await sendVerificationEmail(email, code)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification code sent'
    })
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json(
      { error: 'Failed to resend code' },
      { status: 500 }
    )
  }
}
