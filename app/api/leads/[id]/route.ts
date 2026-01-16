import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const lead = await prisma.lead.findFirst({
      where: { id, userId },
      include: {
        property: { select: { id: true, title: true, address: true, image: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const existing = await prisma.lead.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, status, priority, notes, budget, preferredArea, propertyId, nextFollowUp } = body

    const oldStatus = existing.status
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status,
        priority,
        notes,
        budget: budget ? parseFloat(budget) : null,
        preferredArea,
        propertyId,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        lastContactAt: new Date()
      }
    })

    // Log status change
    if (status && status !== oldStatus) {
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: 'STATUS_CHANGE',
          description: `Status changed from ${oldStatus} to ${status}`
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const lead = await prisma.lead.findFirst({ where: { id, userId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}
