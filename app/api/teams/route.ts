import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import { checkLimit } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

// GET - List user's teams
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const teams = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true }
                }
              }
            },
            _count: { select: { members: true } }
          }
        }
      }
    })

    return NextResponse.json(teams.map(tm => ({
      ...tm.team,
      myRole: tm.role
    })))
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

// POST - Create a new team
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check subscription allows team feature (PROFESSIONAL or ENTERPRISE)
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription || !['PROFESSIONAL', 'ENTERPRISE'].includes(subscription.plan)) {
      return NextResponse.json({
        error: 'Team feature requires Professional or Enterprise plan',
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Team name is required (min 2 characters)' }, { status: 400 })
    }

    // Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let slug = baseSlug
    let counter = 1

    while (await prisma.team.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create team with owner as first member
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          slug,
          description,
          ownerId: userId
        }
      })

      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId,
          role: 'OWNER'
        }
      })

      return newTeam
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}
