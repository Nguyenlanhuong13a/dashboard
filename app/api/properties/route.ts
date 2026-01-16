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
    const filterUserId = searchParams.get('userId')
    const listingType = searchParams.get('listingType')
    const propertyType = searchParams.get('propertyType')
    const city = searchParams.get('city')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId // Default: only show user's own properties
    }

    if (filterUserId) where.userId = filterUserId
    if (listingType) where.listingType = listingType
    if (propertyType) where.propertyType = propertyType
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (featured === 'true') where.featured = true

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          price: true,
          monthlyRent: true,
          listingType: true,
          propertyType: true,
          beds: true,
          baths: true,
          sqft: true,
          image: true,
          featured: true,
          capRate: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
          _count: { select: { favorites: true } }
        }
      }),
      prisma.property.count({ where })
    ])

    return NextResponse.json({
      data: properties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check subscription limit
    const limitCheck = await checkLimit(userId, 'properties')
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Property limit reached',
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()

    const {
      title,
      address,
      city,
      state,
      zipCode,
      price,
      monthlyRent,
      listingType,
      propertyType,
      beds,
      baths,
      sqft,
      yearBuilt,
      image,
      featured,
      leadSource,
      listingAgent,
      hoaFees,
      propertyTax,
      commissionRate,
    } = body

    // Calculate financial metrics
    const annualRent = (monthlyRent || 0) * 12
    const noi = annualRent * 0.7
    const capRate = price > 0 ? (noi / price) * 100 : 0
    const grossYield = price > 0 ? (annualRent / price) * 100 : 0
    const pricePerSqft = sqft > 0 ? (price || monthlyRent * 100) / sqft : 0
    const commissionAmount = (price || 0) * ((commissionRate || 2.5) / 100)

    const property = await prisma.property.create({
      data: {
        userId,
        title,
        address,
        city,
        state,
        zipCode,
        price: price || 0,
        monthlyRent: monthlyRent || 0,
        listingType: listingType === 'For Rent' ? 'FOR_RENT' : 'FOR_SALE',
        propertyType: propertyType?.toUpperCase().replace(' ', '_') || 'RESIDENTIAL',
        beds: beds || 0,
        baths: baths || 0,
        sqft: sqft || 0,
        yearBuilt,
        image,
        featured: featured || false,
        leadSource,
        listingAgent,
        hoaFees: hoaFees || 0,
        propertyTax: propertyTax || price * 0.012,
        insuranceCost: price * 0.002,
        commissionRate: commissionRate || 2.5,
        capRate,
        noi,
        grossYield,
        pricePerSqft,
        commissionAmount,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
  }
}
