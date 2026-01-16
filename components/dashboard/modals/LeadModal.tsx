'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface LeadModalProps {
  lead?: {
    id: string
    name: string
    email: string
    phone: string | null
    source: string
    priority: string
    status: string
    budget: number | null
    preferredArea: string | null
    notes?: string | null
  }
  onClose: () => void
  onSuccess: () => void
}

export function LeadModal({ lead, onClose, onSuccess }: LeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'WEBSITE',
    priority: lead?.priority || 'MEDIUM',
    status: lead?.status || 'NEW',
    budget: lead?.budget?.toString() || '',
    preferredArea: lead?.preferredArea || '',
    notes: lead?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = lead ? `/api/leads/${lead.id}` : '/api/leads'
      const method = lead ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, budget: formData.budget ? parseFloat(formData.budget) : null }),
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md max-h-[90vh] overflow-y-auto glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-dark">{lead ? 'Edit Lead' : 'Add Lead'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-primary-dark/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-glass" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-glass" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Phone</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-glass" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Source</label>
              <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="input-glass">
                <option value="WEBSITE">Website</option>
                <option value="REFERRAL">Referral</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="COLD_CALL">Cold Call</option>
                <option value="OPEN_HOUSE">Open House</option>
                <option value="ZILLOW">Zillow</option>
                <option value="REALTOR">Realtor.com</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input-glass">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          {lead && (
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input-glass">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="SHOWING">Showing</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Budget ($)</label>
              <input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input-glass" placeholder="500000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Preferred Area</label>
              <input type="text" value={formData.preferredArea} onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })} className="input-glass" placeholder="Downtown Miami" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} className="input-glass resize-none" placeholder="Additional notes about the lead..." />
          </div>
          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} className="btn-glass flex-1 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving…' : lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
