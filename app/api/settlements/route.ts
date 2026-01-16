import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

const PLATFORM_FEE_PERCENT = 0.5 // 0.5% platform fee on transactions

// GET - List settlements
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }
    if (status) where.status = status
    if (type) where.type = type

    const [settlements, total, stats] = await Promise.all([
      prisma.settlement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.settlement.count({ where }),
      prisma.settlement.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: {
          propertyPrice: true,
          commissionAmount: true,
          agentAmount: true,
          platformFee: true
        },
        _count: true
      })
    ])

    return NextResponse.json({
      data: settlements,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: {
        totalDeals: stats._count,
        totalVolume: stats._sum.propertyPrice || 0,
        totalCommissions: stats._sum.commissionAmount || 0,
        netEarnings: stats._sum.agentAmount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching settlements:', error)
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 })
  }
}

// POST - Create settlement
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      type,
      propertyPrice,
      commissionRate,
      propertyId,
      buyerName,
      buyerEmail,
      sellerName,
      sellerEmail,
      closingDate,
      notes
    } = body

    if (!type || !propertyPrice || !commissionRate) {
      return NextResponse.json({ error: 'Type, price, and commission rate are required' }, { status: 400 })
    }

    // Calculate amounts
    const commissionAmount = propertyPrice * (commissionRate / 100)
    const platformFee = commissionAmount * (PLATFORM_FEE_PERCENT / 100)
    const agentAmount = commissionAmount - platformFee

    const settlement = await prisma.settlement.create({
      data: {
        type,
        propertyPrice,
        commissionRate,
        commissionAmount,
        platformFee,
        agentAmount,
        propertyId,
        buyerName,
        buyerEmail,
        sellerName,
        sellerEmail,
        closingDate: closingDate ? new Date(closingDate) : null,
        notes,
        userId
      }
    })

    return NextResponse.json(settlement, { status: 201 })
  } catch (error) {
    console.error('Error creating settlement:', error)
    return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 })
  }
}
