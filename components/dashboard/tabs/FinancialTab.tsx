'use client'

import { DollarSign, TrendingUp, Wallet, Target, Plus, Pencil, Trash2 } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart } from '@/components/dashboard/Charts'
import { EmptyState } from '@/components/dashboard/shared'

interface Transaction {
  id: string
  type: string
  description: string
  amount: number
  date: string
  propertyId: string | null
  property?: { id: string; title: string; address: string } | null
}

interface FinancialStats {
  financials: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    totalCommissions: number
  }
  charts: {
    monthlyData: Array<{
      month: string
      properties: number
      income: number
      expenses: number
      revenue: number
    }>
  }
}

interface FinancialTabProps {
  stats: FinancialStats
  transactions: Transaction[]
  onAddTransaction: () => void
  onEditTransaction: (transaction: Transaction) => void
  onDeleteTransaction: (id: string) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function FinancialTab({
  stats,
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}: FinancialTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Income" value={formatCurrency(stats.financials.totalIncome)} icon={TrendingUp} />
        <StatsCard title="Total Expenses" value={formatCurrency(stats.financials.totalExpenses)} icon={Wallet} />
        <StatsCard title="Net Income" value={formatCurrency(stats.financials.netIncome)} icon={DollarSign} />
        <StatsCard title="Commissions" value={formatCurrency(stats.financials.totalCommissions)} icon={Target} />
      </div>

      <RevenueChart data={stats.charts.monthlyData} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-primary-dark">
            Transactions <span className="text-primary-dark/50">({transactions.length})</span>
          </h2>
          <button
            onClick={onAddTransaction}
            className="btn-primary flex items-center gap-2 !px-4 !py-2.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <EmptyState icon={DollarSign} title="No transactions yet" action={onAddTransaction} actionLabel="Add Transaction" />
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Description</th>
                  <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Property</th>
                  <th className="text-right px-5 py-3 font-medium text-primary-dark/70">Amount</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3 text-primary-dark/70">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-primary-dark">{t.description}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-lg ${
                        t.type === 'INCOME' || t.type === 'COMMISSION'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-primary-dark/60">{t.property?.title || '-'}</td>
                    <td className={`px-5 py-3 text-right font-medium ${
                      t.type === 'EXPENSE' ? 'text-red-600' : 'text-primary'
                    }`}>
                      {t.type === 'EXPENSE' ? '-' : '+'}${t.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => onEditTransaction(t)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary-dark/50" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
