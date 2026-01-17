'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
}

export function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded hover:border-gray-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="font-display text-2xl font-semibold text-primary tabular-nums">{value}</p>
          {change && (
            <div className={`inline-flex items-center gap-1 text-xs font-medium ${
              changeType === 'up'
                ? 'text-green-600'
                : changeType === 'down'
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {changeType === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
              {changeType === 'down' && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              <span className="tabular-nums">{change}</span>
            </div>
          )}
        </div>
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
    </div>
  )
}
