import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { rateLimit, rateLimitConfigs, getClientIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// GET - List available leads in marketplace
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const propertyType = searchParams.get('propertyType')
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      sellerId: { not: userId } // Don't show own listings
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    if (propertyType) {
      where.propertyType = propertyType
    }
    if (minBudget) {
      where.budget = { gte: parseFloat(minBudget) }
    }
    if (maxBudget) {
      where.budgetMax = { lte: parseFloat(maxBudget) }
    }

    const [listings, total] = await Promise.all([
      prisma.leadListing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          propertyType: true,
          budget: true,
          budgetMax: true,
          views: true,
          createdAt: true,
          // Don't expose lead details before purchase
        }
      }),
      prisma.leadListing.count({ where })
    ])

    return NextResponse.json({
      data: listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching marketplace:', error)
    return NextResponse.json({ error: 'Failed to fetch marketplace' }, { status: 500 })
  }
}

// POST - List a lead for sale
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const clientIP = getClientIP(request)
  const rateLimitResult = rateLimit(`marketplace_post_${clientIP}`, rateLimitConfigs.api)
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const {
      title,
      description,
      price,
      location,
      propertyType,
      budget,
      budgetMax,
      leadName,
      leadEmail,
      leadPhone,
      leadNotes,
      expiresInDays
    } = body

    // Validation
    if (!title || !price || !location || !leadName || !leadEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (price < 5 || price > 500) {
      return NextResponse.json({ error: 'Price must be between $5 and $500' }, { status: 400 })
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

    const listing = await prisma.leadListing.create({
      data: {
        title,
        description,
        price,
        location,
        propertyType,
        budget,
        budgetMax,
        leadName,
        leadEmail,
        leadPhone,
        leadNotes,
        expiresAt,
        sellerId: userId
      }
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
