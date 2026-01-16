import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import prisma from '@/lib/prisma'
import Stripe from 'stripe'

// Disable body parsing - we need raw body for webhook verification
export const dynamic = 'force-dynamic'

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, plan, subscriptionId } = session.metadata || {}

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session:', session.id)
    throw new Error('Missing required metadata - cannot process payment')
  }

  // Get payment intent ID
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id

  if (!paymentIntentId) {
    console.error('No payment intent in session:', session.id)
    throw new Error('No payment intent - cannot process payment')
  }

  // Check for existing completed payment (idempotency - BEFORE any writes)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      OR: [
        { stripeSessionId: session.id, status: 'COMPLETED' },
        { stripePaymentIntentId: paymentIntentId, status: 'COMPLETED' }
      ]
    }
  })

  if (existingPayment) {
    console.log('Payment already completed (idempotent):', existingPayment.id)
    return // Already processed - safe to skip
  }

  // Use transaction to ensure atomicity: payment + subscription + notification
  await prisma.$transaction(async (tx) => {
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    // Find existing payment record
    const payment = await tx.payment.findFirst({
      where: {
        OR: [
          { stripeSessionId: session.id },
          { stripePaymentIntentId: `pending_${session.id}` }
        ]
      }
    })

    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          stripePaymentIntentId: paymentIntentId,
          status: 'COMPLETED',
          completedAt: now
        }
      })
    } else {
      await tx.payment.create({
        data: {
          stripePaymentIntentId: paymentIntentId,
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || 'usd',
          status: 'COMPLETED',
          plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
          userId,
          subscriptionId: subscriptionId || undefined,
          completedAt: now
        }
      })
    }

    // Update subscription within same transaction
    await tx.subscription.upsert({
      where: { userId },
      update: {
        plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        plan: plan as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        stripeCustomerId: session.customer as string,
      }
    })

    // Create success notification within same transaction
    await tx.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Payment Successful',
        message: `Your subscription has been upgraded to ${plan}. Thank you for your payment!`,
        actionUrl: '/'
      }
    })
  })

  console.log(`Successfully upgraded user ${userId} to ${plan}`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id }
  })

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' }
    })

    // Notify user of failure
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_DUE',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again with a different payment method.',
        actionUrl: '/'
      }
    })
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId }
  })

  if (payment && payment.status === 'COMPLETED') {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' }
      })

      await tx.subscription.update({
        where: { userId: payment.userId },
        data: { plan: 'FREE', status: 'CANCELED' }
      })

      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: 'SYSTEM',
          title: 'Refund Processed',
          message: 'Your payment has been refunded. Your plan has been changed to Free.',
          actionUrl: '/'
        }
      })
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id

  if (!customerId) return

  const userSub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (userSub) {
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: userSub.id },
        data: { plan: 'FREE', status: 'CANCELED' }
      })

      await tx.notification.create({
        data: {
          userId: userSub.userId,
          type: 'SYSTEM',
          title: 'Subscription Canceled',
          message: 'Your subscription has been canceled. You have been moved to the Free plan.',
          actionUrl: '/'
        }
      })
    })
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  if (!customerId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (subscription) {
    await prisma.notification.create({
      data: {
        userId: subscription.userId,
        type: 'PAYMENT_DUE',
        title: 'Payment Failed',
        message: 'Your subscription payment failed. Please update your payment method to avoid service interruption.',
        actionUrl: '/'
      }
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}

        if (metadata.type === 'lead_purchase') {
          await handleLeadPurchase(session)
        } else if (metadata.type === 'credit_purchase') {
          await handleCreditPurchase(session)
        } else {
          await handleCheckoutComplete(session)
        }
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Handle lead marketplace purchase
async function handleLeadPurchase(session: Stripe.Checkout.Session) {
  const { listingId, buyerId, sellerId, platformFee, sellerAmount } = session.metadata || {}

  if (!listingId || !buyerId) {
    console.error('Missing metadata for lead purchase')
    return
  }

  await prisma.$transaction(async (tx) => {
    // Update purchase status
    await tx.leadPurchase.updateMany({
      where: { listingId, buyerId, status: 'PENDING' },
      data: { status: 'COMPLETED', completedAt: new Date() }
    })

    // Mark listing as sold (optional: could allow multiple purchases)
    await tx.leadListing.update({
      where: { id: listingId },
      data: { status: 'SOLD' }
    })

    // Notify buyer
    await tx.notification.create({
      data: {
        userId: buyerId,
        type: 'SYSTEM',
        title: 'Lead Purchased Successfully',
        message: 'You can now view the full lead details.',
        actionUrl: `/marketplace/${listingId}`
      }
    })

    // Notify seller
    if (sellerId) {
      await tx.notification.create({
        data: {
          userId: sellerId,
          type: 'SYSTEM',
          title: 'Lead Sold!',
          message: `Your lead was purchased. You earned $${sellerAmount}.`,
          actionUrl: '/marketplace/my-listings'
        }
      })
    }
  })

  console.log(`Lead purchase completed: ${listingId}`)
}

// Handle credit purchase
async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const { creditType, creditAmount, userId } = session.metadata || {}

  if (!creditType || !creditAmount || !userId) {
    console.error('Missing metadata for credit purchase')
    return
  }

  const amount = parseInt(creditAmount)

  await prisma.$transaction(async (tx) => {
    // Add credits to user
    const updateField = creditType === 'LEAD' ? 'leadCredits'
      : creditType === 'AI' ? 'aiCredits'
      : 'emailCredits'

    await tx.userCredits.upsert({
      where: { userId },
      update: { [updateField]: { increment: amount } },
      create: { userId, [updateField]: amount }
    })

    // Log transaction
    await tx.creditTransaction.create({
      data: {
        userId,
        type: creditType as 'LEAD' | 'AI' | 'EMAIL',
        amount,
        action: 'PURCHASE',
        description: `Purchased ${amount} ${creditType.toLowerCase()} credits`
      }
    })

    // Notify user
    await tx.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Credits Added',
        message: `${amount} ${creditType.toLowerCase()} credits have been added to your account.`,
        actionUrl: '/settings'
      }
    })
  })

  console.log(`Credit purchase completed: ${amount} ${creditType} credits for user ${userId}`)
}
