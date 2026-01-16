import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// GET - Fetch single property by ID (only owner can view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const property = await prisma.property.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        documents: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 10
        },
        _count: {
          select: { favorites: true }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
  }
}

// PUT - Update property (only owner can update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.property.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await request.json()

    // Recalculate financial metrics if price/rent changed
    if (body.price || body.monthlyRent) {
      const annualRent = (body.monthlyRent || 0) * 12
      const noi = annualRent * 0.7
      const price = body.price || 0
      const sqft = body.sqft || 1

      body.noi = noi
      body.capRate = price > 0 ? (noi / price) * 100 : 0
      body.grossYield = price > 0 ? (annualRent / price) * 100 : 0
      body.pricePerSqft = sqft > 0 ? price / sqft : 0
      body.commissionAmount = price * ((body.commissionRate || 2.5) / 100)
    }

    // Convert enum values
    if (body.listingType) {
      body.listingType = body.listingType === 'For Rent' ? 'FOR_RENT' : 'FOR_SALE'
    }
    if (body.propertyType) {
      body.propertyType = body.propertyType.toUpperCase().replace(' ', '_')
    }

    const property = await prisma.property.update({
      where: { id },
      data: body,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(property)
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}

// DELETE - Delete property (only owner can delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership before delete
    const property = await prisma.property.findFirst({ where: { id, userId } })
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
  }
}
