import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Simple lead scoring algorithm
// In production, this would use ML models
function calculateLeadScore(lead: {
  status: string
  priority: string
  budget: number | null
  source: string
  lastContactAt: Date | null
  createdAt: Date
  activities: { type: string }[]
}): { score: number; confidence: number; factors: Record<string, number>; prediction: string } {
  const factors: Record<string, number> = {}
  let score = 50 // Base score

  // Status scoring
  const statusScores: Record<string, number> = {
    NEW: 10,
    CONTACTED: 15,
    QUALIFIED: 25,
    SHOWING: 30,
    NEGOTIATING: 35,
    CLOSED_WON: 0, // Already converted
    CLOSED_LOST: 0
  }
  factors.status = statusScores[lead.status] || 0
  score += factors.status

  // Priority scoring
  const priorityScores: Record<string, number> = {
    URGENT: 15,
    HIGH: 10,
    MEDIUM: 5,
    LOW: 0
  }
  factors.priority = priorityScores[lead.priority] || 0
  score += factors.priority

  // Budget scoring (higher budget = higher score)
  if (lead.budget) {
    if (lead.budget >= 1000000) factors.budget = 15
    else if (lead.budget >= 500000) factors.budget = 12
    else if (lead.budget >= 250000) factors.budget = 8
    else if (lead.budget >= 100000) factors.budget = 5
    else factors.budget = 2
    score += factors.budget
  }

  // Source quality scoring
  const sourceScores: Record<string, number> = {
    REFERRAL: 15,
    ZILLOW: 10,
    REALTOR: 10,
    OPEN_HOUSE: 8,
    WEBSITE: 5,
    SOCIAL_MEDIA: 3,
    COLD_CALL: 2,
    OTHER: 1
  }
  factors.source = sourceScores[lead.source] || 0
  score += factors.source

  // Engagement scoring (based on activities)
  const activityCount = lead.activities.length
  if (activityCount >= 10) factors.engagement = 15
  else if (activityCount >= 5) factors.engagement = 10
  else if (activityCount >= 2) factors.engagement = 5
  else factors.engagement = 0
  score += factors.engagement

  // Recency scoring
  if (lead.lastContactAt) {
    const daysSinceContact = Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceContact <= 1) factors.recency = 10
    else if (daysSinceContact <= 7) factors.recency = 7
    else if (daysSinceContact <= 14) factors.recency = 4
    else if (daysSinceContact <= 30) factors.recency = 1
    else factors.recency = -5 // Penalty for stale leads
    score += factors.recency
  }

  // Cap score
  score = Math.max(0, Math.min(100, score))

  // Calculate confidence based on data completeness
  let confidence = 0.5
  if (lead.budget) confidence += 0.1
  if (lead.lastContactAt) confidence += 0.1
  if (lead.activities.length > 0) confidence += 0.2
  if (lead.priority !== 'MEDIUM') confidence += 0.1
  confidence = Math.min(1, confidence)

  // Prediction
  let prediction = 'UNKNOWN'
  if (score >= 80) prediction = 'HIGH_INTENT'
  else if (score >= 60) prediction = 'LIKELY_TO_CONVERT'
  else if (score >= 40) prediction = 'MODERATE_INTEREST'
  else if (score >= 20) prediction = 'LOW_INTEREST'
  else prediction = 'UNLIKELY'

  return { score, confidence, factors, prediction }
}

// POST - Calculate/update lead scores
export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check subscription (AI features require paid plan)
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription || subscription.plan === 'FREE') {
      return NextResponse.json({
        error: 'AI Lead Scoring requires a paid subscription',
        upgradeRequired: true
      }, { status: 403 })
    }

    const body = await request.json()
    const { leadIds } = body // Optional: specific leads to score

    // Get leads to score
    const where: Record<string, unknown> = {
      userId,
      status: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
    }
    if (leadIds && Array.isArray(leadIds)) {
      where.id = { in: leadIds }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        activities: { select: { type: true } }
      },
      take: 100 // Limit batch size
    })

    // Calculate and upsert scores
    const scores = await Promise.all(leads.map(async (lead) => {
      const scoreData = calculateLeadScore({
        status: lead.status,
        priority: lead.priority,
        budget: lead.budget,
        source: lead.source,
        lastContactAt: lead.lastContactAt,
        createdAt: lead.createdAt,
        activities: lead.activities
      })

      return prisma.leadScore.upsert({
        where: { leadId: lead.id },
        update: {
          score: scoreData.score,
          confidence: scoreData.confidence,
          factors: scoreData.factors,
          prediction: scoreData.prediction,
          calculatedAt: new Date()
        },
        create: {
          leadId: lead.id,
          score: scoreData.score,
          confidence: scoreData.confidence,
          factors: scoreData.factors,
          prediction: scoreData.prediction
        }
      })
    }))

    return NextResponse.json({
      processed: scores.length,
      scores: scores.map(s => ({
        leadId: s.leadId,
        score: s.score,
        prediction: s.prediction
      }))
    })
  } catch (error) {
    console.error('Error scoring leads:', error)
    return NextResponse.json({ error: 'Failed to score leads' }, { status: 500 })
  }
}

// GET - Get lead scores
export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const prediction = searchParams.get('prediction')

    const scores = await prisma.leadScore.findMany({
      where: {
        lead: { userId },
        score: { gte: minScore },
        ...(prediction && { prediction })
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            priority: true,
            budget: true
          }
        }
      },
      orderBy: { score: 'desc' },
      take: 50
    })

    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }
}
