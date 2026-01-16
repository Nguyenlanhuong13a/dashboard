import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Plan limits
const PLAN_LIMITS = {
  FREE: { properties: 5, leads: 20, documents: 10, teamMembers: 1 },
  STARTER: { properties: 25, leads: 100, documents: 50, teamMembers: 3 },
  PROFESSIONAL: { properties: 100, leads: 500, documents: 200, teamMembers: 10 },
  ENTERPRISE: { properties: -1, leads: -1, documents: -1, teamMembers: -1 } // Unlimited
}

const PLAN_PRICES = {
  FREE: 0,
  STARTER: 29,
  PROFESSIONAL: 79,
  ENTERPRISE: 199
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    // Create free subscription if none exists
    if (!subscription) {
      const now = new Date()
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getFullYear() + 100, 0, 1) // Never expires
        }
      })
    }

    // Get current usage
    const [propertyCount, leadCount, documentCount] = await Promise.all([
      prisma.property.count({ where: { userId } }),
      prisma.lead.count({ where: { userId } }),
      prisma.document.count({ where: { userId } })
    ])

    const plan = subscription.plan as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[plan]

    return NextResponse.json({
      subscription,
      usage: {
        properties: { current: propertyCount, limit: limits.properties },
        leads: { current: leadCount, limit: limits.leads },
        documents: { current: documentCount, limit: limits.documents }
      },
      plans: Object.entries(PLAN_LIMITS).map(([name, limits]) => ({
        name,
        price: PLAN_PRICES[name as keyof typeof PLAN_PRICES],
        limits,
        current: name === plan
      }))
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { plan } = body

    if (!['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Plan Updated',
        message: `Your subscription has been updated to ${plan}`,
        actionUrl: '/settings'
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
