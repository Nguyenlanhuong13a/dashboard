import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const PLATFORM_FEE_PERCENT = 20 // 20% platform fee

// POST - Purchase a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get listing
    const listing = await prisma.leadListing.findFirst({
      where: { id, status: 'ACTIVE' }
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found or no longer available' }, { status: 404 })
    }

    // Can't buy own listing
    if (listing.sellerId === userId) {
      return NextResponse.json({ error: 'Cannot purchase your own listing' }, { status: 400 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.leadPurchase.findFirst({
      where: { listingId: id, buyerId: userId, status: 'COMPLETED' }
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'You have already purchased this lead' }, { status: 400 })
    }

    // Calculate fees
    const amount = listing.price
    const platformFee = amount * (PLATFORM_FEE_PERCENT / 100)
    const sellerAmount = amount - platformFee

    // Get user for Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Lead: ${listing.title}`,
            description: `Location: ${listing.location}`
          },
          unit_amount: Math.round(amount * 100) // cents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace?purchase=success&listing=${id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace?purchase=cancelled`,
      customer_email: user?.email,
      metadata: {
        type: 'lead_purchase',
        listingId: id,
        buyerId: userId,
        sellerId: listing.sellerId,
        amount: amount.toString(),
        platformFee: platformFee.toString(),
        sellerAmount: sellerAmount.toString()
      }
    })

    // Create pending purchase record
    await prisma.leadPurchase.create({
      data: {
        amount,
        platformFee,
        sellerAmount,
        status: 'PENDING',
        buyerId: userId,
        listingId: id,
        stripePaymentId: session.id
      }
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Error purchasing lead:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}

// GET - Get purchased lead details (after purchase)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if user purchased this lead
    const purchase = await prisma.leadPurchase.findFirst({
      where: { listingId: id, buyerId: userId, status: 'COMPLETED' },
      include: {
        listing: true
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'You have not purchased this lead' }, { status: 403 })
    }

    // Return full lead details
    return NextResponse.json({
      purchase: {
        id: purchase.id,
        amount: purchase.amount,
        completedAt: purchase.completedAt
      },
      lead: {
        name: purchase.listing.leadName,
        email: purchase.listing.leadEmail,
        phone: purchase.listing.leadPhone,
        notes: purchase.listing.leadNotes,
        location: purchase.listing.location,
        budget: purchase.listing.budget,
        budgetMax: purchase.listing.budgetMax,
        propertyType: purchase.listing.propertyType
      }
    })
  } catch (error) {
    console.error('Error fetching purchased lead:', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}
