import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_AMOUNTS, PlanType } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { plan } = await request.json()

    // Validate plan
    if (!['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planType = plan as PlanType
    const amount = PLAN_AMOUNTS[planType]

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for pending payment for same plan (prevent spam)
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        plan: planType,
        status: { in: ['PENDING', 'PROCESSING'] },
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
      }
    })

    if (pendingPayment) {
      // Return existing session if still valid
      if (pendingPayment.stripeSessionId) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(pendingPayment.stripeSessionId)
          if (existingSession.status === 'open') {
            return NextResponse.json({
              url: existingSession.url,
              sessionId: existingSession.id,
              message: 'Using existing checkout session'
            })
          }
        } catch {
          // Session expired, continue to create new one
        }
      }
    }

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId }
      })
      customerId = customer.id

      // Update or create subscription with customer ID
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId }
        })
      } else {
        const now = new Date()
        subscription = await prisma.subscription.create({
          data: {
            userId,
            plan: 'FREE',
            status: 'ACTIVE',
            stripeCustomerId: customerId,
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getFullYear() + 100, 0, 1)
          }
        })
      }
    }

    // At this point subscription is guaranteed to exist
    if (!subscription) {
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    // Create idempotency key based on user, plan, and timestamp (hour granularity)
    const hourTimestamp = Math.floor(Date.now() / (1000 * 60 * 60))
    const idempotencyKey = `checkout_${userId}_${plan}_${hourTimestamp}`

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan} Plan - Monthly Subscription`,
            description: `RealEstate Pro ${plan} Plan`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      metadata: {
        userId,
        plan: planType,
        subscriptionId: subscription.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    }, {
      idempotencyKey,
    })

    // Create payment record to track this attempt
    await prisma.payment.create({
      data: {
        stripePaymentIntentId: session.payment_intent as string || `pending_${session.id}`,
        stripeSessionId: session.id,
        amount,
        currency: 'usd',
        status: 'PENDING',
        plan: planType,
        userId,
        subscriptionId: subscription.id,
      }
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Create checkout error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create checkout', details: message }, { status: 500 })
  }
}
