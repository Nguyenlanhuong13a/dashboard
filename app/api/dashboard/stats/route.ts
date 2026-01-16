import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth/server'

export const dynamic = 'force-dynamic'

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5000 // 5 seconds

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

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check cache
    const cacheKey = `stats_${userId}`
    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Parallel database queries with aggregations
    const [
      propertyCounts,
      propertyAggregates,
      propertyTypes,
      transactionAggregates,
      monthlyStats,
      recentTransactions
    ] = await Promise.all([
      // Count queries (fast indexed operations)
      prisma.property.groupBy({
        by: ['listingType', 'occupancyStatus'],
        where: { userId },
        _count: true,
      }),

      // Aggregate financials at database level
      prisma.property.aggregate({
        where: { userId },
        _sum: { price: true, monthlyRent: true, commissionAmount: true },
        _avg: { capRate: true },
        _count: true,
      }),

      // Property type distribution
      prisma.property.groupBy({
        by: ['propertyType'],
        where: { userId },
        _count: true,
      }),

      // Transaction aggregates by type
      prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
      }),

      // Monthly data using raw query for performance
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', date), 'Mon') as month,
          DATE_TRUNC('month', date) as month_date,
          SUM(CASE WHEN type IN ('INCOME', 'COMMISSION') THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses
        FROM "transactions"
        WHERE date >= ${sixMonthsAgo} AND "userId" = ${userId}
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month_date ASC
      ` as Promise<Array<{ month: string; income: number; expenses: number }>>,

      // Recent transactions (limit 10)
      prisma.transaction.findMany({
        where: { userId },
        take: 10,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          type: true,
          description: true,
          amount: true,
          date: true,
          property: { select: { title: true } }
        }
      })
    ])

    // Process counts efficiently
    let totalProperties = 0
    let forSaleCount = 0
    let forRentCount = 0
    let occupiedCount = 0

    for (const item of propertyCounts) {
      totalProperties += item._count
      if (item.listingType === 'FOR_SALE') forSaleCount += item._count
      if (item.listingType === 'FOR_RENT') forRentCount += item._count
      if (item.occupancyStatus === 'OCCUPIED') occupiedCount += item._count
    }

    // Process transaction aggregates
    let totalIncome = 0
    let totalExpenses = 0
    for (const item of transactionAggregates) {
      if (item.type === 'INCOME' || item.type === 'COMMISSION') {
        totalIncome += Number(item._sum.amount) || 0
      } else if (item.type === 'EXPENSE') {
        totalExpenses += Number(item._sum.amount) || 0
      }
    }

    // Build property type distribution
    const propertyTypeDistribution: Record<string, number> = {}
    for (const item of propertyTypes) {
      propertyTypeDistribution[item.propertyType] = item._count
    }

    // Build monthly data with fallback for missing months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const monthName = monthNames[monthDate.getMonth()]
      const found = (monthlyStats as Array<{ month: string; income: number; expenses: number }>)
        .find(m => m.month === monthName)

      const income = Number(found?.income) || 0
      const expenses = Number(found?.expenses) || 0

      return {
        month: monthName,
        income,
        expenses,
        revenue: income - expenses
      }
    })

    const response = {
      overview: {
        totalProperties,
        forSaleCount,
        forRentCount,
        occupiedCount,
        vacancyRate: totalProperties > 0
          ? ((totalProperties - occupiedCount) / totalProperties * 100).toFixed(1)
          : '0',
      },
      financials: {
        totalPortfolioValue: Number(propertyAggregates._sum.price) || 0,
        totalMonthlyRent: Number(propertyAggregates._sum.monthlyRent) || 0,
        annualRent: (Number(propertyAggregates._sum.monthlyRent) || 0) * 12,
        avgCapRate: (Number(propertyAggregates._avg.capRate) || 0).toFixed(2),
        totalCommissions: Number(propertyAggregates._sum.commissionAmount) || 0,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
      },
      charts: {
        propertyTypeDistribution,
        monthlyData,
      },
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: t.amount,
        date: t.date,
        property: t.property?.title || 'General'
      }))
    }

    // Cache result
    setCache(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
