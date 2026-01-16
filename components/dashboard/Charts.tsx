'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { BarChart3, Building2 } from 'lucide-react'

interface MonthlyData {
  month: string
  properties: number
  income: number
  expenses: number
  revenue: number
}

interface RevenueChartProps {
  data: MonthlyData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data && data.some(d => d.income > 0 || d.expenses > 0)

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-sm font-semibold text-primary-dark">Revenue Overview</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-primary-dark/60">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-xs text-primary-dark/60">Expenses</span>
          </div>
        </div>
      </div>
      {hasData ? (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F766E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0F766E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0369A1" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 118, 110, 0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#134E4A', fontSize: 12, opacity: 0.6 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#134E4A', fontSize: 12, opacity: 0.6 }}
                tickFormatter={(value) => `$${value / 1000}K`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(15, 118, 110, 0.15)',
                  padding: '12px 16px',
                }}
                labelStyle={{ color: '#134E4A', fontWeight: 600, marginBottom: '4px' }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#0F766E"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                dot={false}
                activeDot={{ r: 6, fill: '#0F766E', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#0369A1"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={{ r: 6, fill: '#0369A1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[280px] flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-primary/40" />
          </div>
          <p className="text-sm text-primary-dark/50">No transaction data yet</p>
        </div>
      )}
    </div>
  )
}

interface PropertyTypeChartProps {
  data: Record<string, number>
}

export function PropertyTypeChart({ data }: PropertyTypeChartProps) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase().replace('_', ' '),
    value,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  const colors = [
    'bg-primary',
    'bg-primary-light',
    'bg-accent',
    'bg-accent-light',
    'bg-accent-gold',
  ]

  return (
    <div className="glass-card p-6">
      <h3 className="font-display text-sm font-semibold text-primary-dark mb-6">Property Types</h3>
      {chartData.length > 0 ? (
        <div className="space-y-5">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-primary-dark/80">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-dark font-semibold tabular-nums">{item.value}</span>
                    <span className="text-primary-dark/40 text-xs tabular-nums">({percentage}%)</span>
                  </div>
                </div>
                <div className="h-2.5 bg-primary/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-40 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-primary/40" />
          </div>
          <p className="text-sm text-primary-dark/50">No properties yet</p>
        </div>
      )}
    </div>
  )
}
