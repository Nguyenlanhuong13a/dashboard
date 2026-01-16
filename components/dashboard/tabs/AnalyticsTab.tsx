'use client'

import { Building2, Target } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart, PropertyTypeChart } from '@/components/dashboard/Charts'

interface AnalyticsStats {
  overview: {
    forSaleCount: number
    forRentCount: number
    vacancyRate: string | number
  }
  charts: {
    propertyTypeDistribution: Record<string, number>
    monthlyData: Array<{
      month: string
      properties: number
      income: number
      expenses: number
      revenue: number
    }>
  }
}

interface AnalyticsTabProps {
  stats: AnalyticsStats
}

export function AnalyticsTab({ stats }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="For Sale" value={stats.overview.forSaleCount} icon={Building2} />
        <StatsCard title="For Rent" value={stats.overview.forRentCount} icon={Building2} />
        <StatsCard title="Vacancy Rate" value={`${stats.overview.vacancyRate}%`} icon={Target} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.charts.monthlyData} />
        <PropertyTypeChart data={stats.charts.propertyTypeDistribution} />
      </div>
    </div>
  )
}
