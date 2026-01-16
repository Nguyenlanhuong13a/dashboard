import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const CREDIT_PRICES = {
  LEAD: { 10: 25, 25: 50, 50: 90, 100: 150 }, // credits: price in dollars
  AI: { 50: 10, 100: 18, 250: 40 },
  EMAIL: { 500: 15, 1000: 25, 2500: 50 }
}

// GET - Get user credits
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let credits = await prisma.userCredits.findUnique({
      where: { userId }
    })

    // Create if doesn't exist
    if (!credits) {
      credits = await prisma.userCredits.create({
        data: { userId }
      })
    }

    // Get recent transactions
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      credits: {
        lead: credits.leadCredits,
        ai: credits.aiCredits,
        email: credits.emailCredits
      },
      transactions
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}

// POST - Purchase credits
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, amount } = body as { type: 'LEAD' | 'AI' | 'EMAIL'; amount: number }

    if (!type || !amount) {
      return NextResponse.json({ error: 'Type and amount are required' }, { status: 400 })
    }

    const prices = CREDIT_PRICES[type]
    if (!prices || !(amount in prices)) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }

    const price = prices[amount as keyof typeof prices]

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    // Create Stripe checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${amount} ${type.toLowerCase()} credits`,
            description: `Credits for ${type.toLowerCase()} features`
          },
          unit_amount: price * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?credits=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?credits=cancelled`,
      customer_email: user?.email,
      metadata: {
        type: 'credit_purchase',
        creditType: type,
        creditAmount: amount.toString(),
        userId
      }
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Error purchasing credits:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}
