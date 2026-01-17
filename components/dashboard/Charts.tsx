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
    <div className="border border-gray-200 rounded p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-sm font-semibold text-primary">Revenue Overview</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-gray-500">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
        </div>
      </div>
      {hasData ? (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E293B" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}K`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#1E293B', fontWeight: 500, marginBottom: '4px' }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#1E293B"
                strokeWidth={1.5}
                fill="url(#incomeGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#1E293B', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#2563EB"
                strokeWidth={1.5}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[260px] flex flex-col items-center justify-center">
          <BarChart3 className="w-6 h-6 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No transaction data yet</p>
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
    'bg-gray-400',
    'bg-accent',
    'bg-gray-300',
    'bg-amber-500',
  ]

  return (
    <div className="border border-gray-200 rounded p-5">
      <h3 className="font-display text-sm font-semibold text-primary mb-5">Property Types</h3>
      {chartData.length > 0 ? (
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium tabular-nums">{item.value}</span>
                    <span className="text-gray-400 text-xs tabular-nums">({percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center">
          <Building2 className="w-6 h-6 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No properties yet</p>
        </div>
      )}
    </div>
  )
}
