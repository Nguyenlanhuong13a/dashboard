import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: sessionId,
        userId
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: payment.status,
      plan: payment.plan,
      completedAt: payment.completedAt
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
