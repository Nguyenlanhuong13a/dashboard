'use client'

import { Building2, DollarSign, Wallet, TrendingUp, Home, ArrowUpRight } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart, PropertyTypeChart } from '@/components/dashboard/Charts'
import { PropertyCard } from '@/components/dashboard/PropertyCard'
import { EmptyState } from '@/components/dashboard/shared'

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  price: number
  monthlyRent: number
  listingType: string
  propertyType: string
  beds: number
  baths: number
  sqft: number
  image: string | null
  featured: boolean
  capRate: number
}

interface DashboardStats {
  overview: {
    totalProperties: number
  }
  financials: {
    totalPortfolioValue: number
    totalMonthlyRent: number
    avgCapRate: string
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

interface DashboardTabProps {
  stats: DashboardStats
  properties: Property[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onNavigateToProperties: () => void
  onAddProperty: () => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function DashboardTab({ stats, properties, favorites, onToggleFavorite, onNavigateToProperties, onAddProperty }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Properties" value={stats.overview.totalProperties} change="+12%" changeType="up" icon={Building2} />
        <StatsCard title="Portfolio Value" value={formatCurrency(stats.financials.totalPortfolioValue)} change="+8.5%" changeType="up" icon={DollarSign} />
        <StatsCard title="Monthly Rent" value={formatCurrency(stats.financials.totalMonthlyRent)} change="+5%" changeType="up" icon={Wallet} />
        <StatsCard title="Avg. Cap Rate" value={`${stats.financials.avgCapRate}%`} change="+0.3%" changeType="up" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.charts.monthlyData} />
        <PropertyTypeChart data={stats.charts.propertyTypeDistribution} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-gray-900">Recent Properties</h2>
          <button
            onClick={onNavigateToProperties}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            View All <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {properties.length === 0 ? (
          <EmptyState icon={Home} title="No properties yet" action={onAddProperty} actionLabel="Add Property" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {properties.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} property={property} onFavorite={onToggleFavorite} isFavorite={favorites.has(property.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
