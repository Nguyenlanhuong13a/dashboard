/**
 * @fileoverview Team Invite API Endpoint
 *
 * Handles team member invitations with the following features:
 * - Role-based access control (only OWNER/ADMIN can invite)
 * - Subscription limit enforcement for team members
 * - Duplicate invite prevention
 * - Secure token generation for invite links
 *
 * @endpoint POST /api/teams/[id]/invite
 * @endpoint GET /api/teams/[id]/invite
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'
import crypto from 'crypto'
import { PLAN_LIMITS } from '@/lib/subscription'
import { sendTeamInviteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

type PlanType = keyof typeof PLAN_LIMITS

// POST - Invite member to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { email, role = 'MEMBER' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify user is team owner or admin
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: id, userId, role: { in: ['OWNER', 'ADMIN'] } },
      include: { team: true }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized to invite members' }, { status: 403 })
    }

    // Check team member limit based on team owner's subscription
    const ownerSubscription = await prisma.subscription.findUnique({
      where: { userId: membership.team.ownerId }
    })
    const plan = (ownerSubscription?.plan || 'FREE') as PlanType
    const memberLimit = PLAN_LIMITS[plan].teamMembers

    // Count current members + pending invites
    const [memberCount, pendingInviteCount] = await Promise.all([
      prisma.teamMember.count({ where: { teamId: id } }),
      prisma.teamInvite.count({ where: { teamId: id, expiresAt: { gt: new Date() } } })
    ])

    const totalMembers = memberCount + pendingInviteCount

    // -1 means unlimited
    if (memberLimit !== -1 && totalMembers >= memberLimit) {
      return NextResponse.json({
        error: `Team member limit reached (${memberLimit} members). Upgrade to add more members.`,
        current: memberCount,
        pending: pendingInviteCount,
        limit: memberLimit,
        upgradeRequired: true
      }, { status: 403 })
    }

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      const existingMember = await prisma.teamMember.findFirst({
        where: { teamId: id, userId: existingUser.id }
      })
      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 })
      }
    }

    // Check for existing invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: { teamId: id, email, expiresAt: { gt: new Date() } }
    })

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 })
    }

    // Create invite
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    const invite = await prisma.teamInvite.create({
      data: {
        email,
        role: role as 'ADMIN' | 'MEMBER' | 'VIEWER',
        token,
        expiresAt,
        teamId: id
      },
      include: {
        team: { select: { name: true } }
      }
    })

    // Send invite email
    const emailResult = await sendTeamInviteEmail(
      email,
      invite.team.name,
      inviter?.name || inviter?.email || 'A team member',
      token
    )

    if (!emailResult.success) {
      console.warn('Failed to send invite email:', emailResult.error)
    }

    return NextResponse.json({
      message: 'Invite sent',
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error inviting member:', error)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}

// GET - List pending invites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Verify user is team owner or admin
    const membership = await prisma.teamMember.findFirst({
      where: { teamId: id, userId, role: { in: ['OWNER', 'ADMIN'] } }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const invites = await prisma.teamInvite.findMany({
      where: { teamId: id, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
  }
}
