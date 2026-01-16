'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface TransactionModalProps {
  transaction?: {
    id: string
    type: string
    description: string
    amount: number
    date: string
    propertyId: string | null
  }
  properties: { id: string; title: string }[]
  onClose: () => void
  onSuccess: () => void
}

export function TransactionModal({ transaction, properties, onClose, onSuccess }: TransactionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: transaction?.type || 'INCOME',
    description: transaction?.description || '',
    amount: transaction?.amount?.toString() || '',
    propertyId: transaction?.propertyId || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = transaction ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) || 0, propertyId: formData.propertyId || null }),
      })

      if (!res.ok) throw new Error('Failed')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-dark">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-primary-dark/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-glass">
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="COMMISSION">Commission</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Description *</label>
            <input type="text" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-glass" placeholder="Monthly rent payment" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Amount ($) *</label>
            <input type="number" required step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="input-glass" placeholder="1500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Property (optional)</label>
            <select value={formData.propertyId} onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })} className="input-glass">
              <option value="">-- None --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-glass" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} className="btn-glass flex-1 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving…' : transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
