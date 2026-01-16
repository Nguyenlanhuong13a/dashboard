import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Cache for analytics
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  return null
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const cacheKey = `analytics_${userId}_${period}`

    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const [
      propertyStats,
      leadStats,
      revenueByMonth,
      propertyPerformance,
      leadConversion,
      topProperties
    ] = await Promise.all([
      // Property stats
      prisma.property.aggregate({
        where: { userId, createdAt: { gte: startDate } },
        _count: true,
        _sum: { price: true, monthlyRent: true, commissionAmount: true },
        _avg: { capRate: true, daysOnMarket: true }
      }),

      // Lead stats
      prisma.lead.groupBy({
        by: ['status'],
        where: { userId, createdAt: { gte: startDate } },
        _count: true
      }),

      // Revenue by month (raw query for performance)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', date), 'Mon YYYY') as month,
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses,
          SUM(CASE WHEN type = 'COMMISSION' THEN amount ELSE 0 END) as commissions
        FROM "transactions"
        WHERE "userId" = ${userId} AND date >= ${startDate}
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date) ASC
      ` as Promise<Array<{ month: string; income: number; expenses: number; commissions: number }>>,

      // Top performing properties by revenue
      prisma.property.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          address: true,
          monthlyRent: true,
          capRate: true,
          occupancyStatus: true,
          transactions: {
            where: { date: { gte: startDate }, type: 'INCOME' },
            select: { amount: true }
          }
        },
        take: 10
      }),

      // Lead conversion funnel
      prisma.$queryRaw`
        SELECT
          status,
          COUNT(*)::int as count,
          AVG(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 86400)::int as avg_days
        FROM leads
        WHERE "userId" = ${userId}
        GROUP BY status
      ` as Promise<Array<{ status: string; count: number; avg_days: number }>>,

      // Properties with most leads
      prisma.property.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          address: true,
          _count: { select: { leads: true, favorites: true } }
        },
        orderBy: { leads: { _count: 'desc' } },
        take: 5
      })
    ])

    // Process lead stats
    const leadStatusCounts: Record<string, number> = {}
    let totalLeads = 0
    for (const s of leadStats) {
      leadStatusCounts[s.status] = s._count
      totalLeads += s._count
    }

    // Process property performance
    const propertyPerformanceData = propertyPerformance.map(p => ({
      id: p.id,
      title: p.title,
      address: p.address,
      monthlyRent: p.monthlyRent,
      capRate: p.capRate,
      occupancyStatus: p.occupancyStatus,
      totalRevenue: p.transactions.reduce((sum, t) => sum + t.amount, 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)

    const response = {
      period,
      properties: {
        new: propertyStats._count,
        totalValue: Number(propertyStats._sum.price) || 0,
        totalRent: Number(propertyStats._sum.monthlyRent) || 0,
        totalCommissions: Number(propertyStats._sum.commissionAmount) || 0,
        avgCapRate: Number(propertyStats._avg.capRate) || 0,
        avgDaysOnMarket: Math.round(Number(propertyStats._avg.daysOnMarket) || 0)
      },
      leads: {
        total: totalLeads,
        byStatus: leadStatusCounts,
        conversionRate: totalLeads > 0
          ? ((leadStatusCounts['CLOSED_WON'] || 0) / totalLeads * 100).toFixed(1)
          : '0',
        funnel: leadConversion
      },
      revenue: {
        byMonth: revenueByMonth,
        total: (revenueByMonth as Array<{ income: number; commissions: number }>)
          .reduce((sum, m) => sum + Number(m.income) + Number(m.commissions), 0)
      },
      topProperties: propertyPerformanceData.slice(0, 5),
      propertiesWithMostLeads: topProperties
    }

    setCache(cacheKey, response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
