import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const propertyId = searchParams.get('propertyId')
    const limit = searchParams.get('limit')

    const where: any = { userId }
    if (type) where.type = type
    if (propertyId) where.propertyId = propertyId

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      include: {
        property: {
          select: { id: true, title: true, address: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, description, amount, propertyId, date } = body

    const transaction = await prisma.transaction.create({
      data: {
        type,
        description,
        amount: parseFloat(amount),
        propertyId: propertyId || null,
        userId,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        property: {
          select: { id: true, title: true, address: true }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
