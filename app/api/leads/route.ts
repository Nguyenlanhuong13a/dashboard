import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { checkLimit } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = { userId }
    if (status) where.status = status
    if (priority) where.priority = priority

    const [leads, total, stats] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          property: { select: { id: true, title: true, address: true } },
          _count: { select: { activities: true } }
        }
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { userId },
        _count: true
      })
    ])

    const statusCounts: Record<string, number> = {}
    for (const s of stats) {
      statusCounts[s.status] = s._count
    }

    return NextResponse.json({
      data: leads,
      stats: statusCounts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check subscription limit
    const limitCheck = await checkLimit(userId, 'leads')
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Lead limit reached',
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, source, priority, notes, budget, preferredArea, propertyId } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source: source || 'WEBSITE',
        priority: priority || 'MEDIUM',
        notes,
        budget: budget ? parseFloat(budget) : null,
        preferredArea,
        propertyId,
        userId,
      },
      include: {
        property: { select: { id: true, title: true } }
      }
    })

    // Create initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'CREATED',
        description: `Lead created from ${source || 'WEBSITE'}`
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'LEAD_NEW',
        title: 'New Lead',
        message: `New lead from ${name} (${email})`,
        actionUrl: `/leads/${lead.id}`
      }
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}
