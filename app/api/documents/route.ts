import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { checkLimit } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const propertyId = searchParams.get('propertyId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId }
    if (category) where.category = category
    if (propertyId) where.propertyId = propertyId

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          property: {
            select: { id: true, title: true, address: true }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.document.count({ where })
    ])

    return NextResponse.json({
      data: documents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription limit
    const limitCheck = await checkLimit(userId, 'documents')
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'Document limit reached',
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, size, url, category, propertyId } = body

    const document = await prisma.document.create({
      data: {
        name,
        type,
        size,
        url,
        category: category || 'OTHER',
        propertyId: propertyId || null,
        userId,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true }
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
