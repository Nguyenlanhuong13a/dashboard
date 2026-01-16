import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// GET - List email campaigns
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }
    if (status) where.status = status

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          template: { select: { name: true, subject: true, type: true } },
          _count: { select: { logs: true } }
        }
      }),
      prisma.emailCampaign.count({ where })
    ])

    return NextResponse.json({
      data: campaigns,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

// POST - Create email campaign
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription || subscription.plan === 'FREE') {
      return NextResponse.json({
        error: 'Email campaigns require a paid subscription',
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, templateId, targetStatus, targetSource, scheduledAt } = body

    if (!name || !templateId) {
      return NextResponse.json({ error: 'Name and template are required' }, { status: 400 })
    }

    // Verify template exists and belongs to user
    const template = await prisma.emailTemplate.findFirst({
      where: { id: templateId, userId }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        templateId,
        userId,
        targetStatus: targetStatus || [],
        targetSource: targetSource || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT'
      },
      include: {
        template: { select: { name: true, subject: true } }
      }
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
