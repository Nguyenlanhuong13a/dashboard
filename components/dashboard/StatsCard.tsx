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
    <div className="glass-card-hover p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary-dark/60">{title}</p>
          <p className="font-display text-2xl font-semibold text-primary-dark tracking-tight tabular-nums">{value}</p>
          {change && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 border ${
              changeType === 'up'
                ? 'text-primary border-primary/30'
                : changeType === 'down'
                ? 'text-red-600 border-red-300'
                : 'text-primary-dark/50 border-primary-dark/20'
            }`}>
              {changeType === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
              {changeType === 'down' && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              <span className="tabular-nums">{change}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
