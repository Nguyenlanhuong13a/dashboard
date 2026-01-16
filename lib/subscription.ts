import prisma from './prisma'

export const PLAN_LIMITS = {
  FREE: {
    properties: 5,
    leads: 20,
    documents: 10,
    teamMembers: 1,
    emailsPerMonth: 50,
    aiScoresPerMonth: 0,
    marketplaceAccess: false,
    settlementTracking: false,
    customTemplates: 3,
    analyticsRetentionDays: 30
  },
  STARTER: {
    properties: 25,
    leads: 100,
    documents: 50,
    teamMembers: 3,
    emailsPerMonth: 500,
    aiScoresPerMonth: 50,
    marketplaceAccess: true,
    settlementTracking: true,
    customTemplates: 10,
    analyticsRetentionDays: 90
  },
  PROFESSIONAL: {
    properties: 100,
    leads: 500,
    documents: 200,
    teamMembers: 10,
    emailsPerMonth: 2500,
    aiScoresPerMonth: 250,
    marketplaceAccess: true,
    settlementTracking: true,
    customTemplates: -1, // unlimited
    analyticsRetentionDays: 365
  },
  ENTERPRISE: {
    properties: -1,
    leads: -1,
    documents: -1,
    teamMembers: -1,
    emailsPerMonth: -1,
    aiScoresPerMonth: -1,
    marketplaceAccess: true,
    settlementTracking: true,
    customTemplates: -1,
    analyticsRetentionDays: -1 // unlimited
  }
}

export const PLAN_PRICES = {
  FREE: 0,
  STARTER: 29,
  PROFESSIONAL: 79,
  ENTERPRISE: 199
}

export type PlanType = keyof typeof PLAN_LIMITS
export type ResourceType = 'properties' | 'leads' | 'documents' | 'teamMembers' | 'emailsPerMonth' | 'aiScoresPerMonth' | 'customTemplates'

export async function checkLimit(
  userId: string,
  resourceType: ResourceType
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  const plan = (subscription?.plan || 'FREE') as PlanType
  const limits = PLAN_LIMITS[plan]
  const limit = limits[resourceType] as number

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 }
  }

  let current = 0
  switch (resourceType) {
    case 'properties':
      current = await prisma.property.count({ where: { userId } })
      break
    case 'leads':
      current = await prisma.lead.count({ where: { userId } })
      break
    case 'documents':
      current = await prisma.document.count({ where: { userId } })
      break
    case 'teamMembers':
      current = await prisma.teamMember.count({
        where: { team: { ownerId: userId } }
      })
      break
    case 'emailsPerMonth':
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      current = await prisma.emailLog.count({
        where: {
          campaign: { userId },
          createdAt: { gte: monthStart }
        }
      })
      break
    case 'aiScoresPerMonth':
      const aiMonthStart = new Date()
      aiMonthStart.setDate(1)
      aiMonthStart.setHours(0, 0, 0, 0)
      current = await prisma.leadScore.count({
        where: {
          lead: { userId },
          calculatedAt: { gte: aiMonthStart }
        }
      })
      break
    case 'customTemplates':
      current = await prisma.emailTemplate.count({ where: { userId } })
      break
  }

  return {
    allowed: current < limit,
    current,
    limit
  }
}

export async function checkFeatureAccess(
  userId: string,
  feature: 'marketplaceAccess' | 'settlementTracking'
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  const plan = (subscription?.plan || 'FREE') as PlanType
  return PLAN_LIMITS[plan][feature] as boolean
}

export async function getSubscriptionInfo(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  const plan = (subscription?.plan || 'FREE') as PlanType
  const limits = PLAN_LIMITS[plan]
  const price = PLAN_PRICES[plan]

  // Get current usage
  const [properties, leads, documents] = await Promise.all([
    prisma.property.count({ where: { userId } }),
    prisma.lead.count({ where: { userId } }),
    prisma.document.count({ where: { userId } })
  ])

  return {
    plan,
    status: subscription?.status || 'ACTIVE',
    price,
    limits,
    usage: {
      properties: { current: properties, limit: limits.properties },
      leads: { current: leads, limit: limits.leads },
      documents: { current: documents, limit: limits.documents }
    },
    currentPeriodEnd: subscription?.currentPeriodEnd,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false
  }
}
