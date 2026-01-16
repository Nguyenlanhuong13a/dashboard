'use client'

import { useState } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  source: string
  budget: number | null
  preferredArea: string | null
}

interface SellLeadModalProps {
  leads: Lead[]
  onClose: () => void
  onSuccess: () => void
}

export function SellLeadModal({ leads, onClose, onSuccess }: SellLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    propertyType: 'RESIDENTIAL',
    budget: '',
    budgetMax: '',
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    leadNotes: '',
    selectedLeadId: '',
  })

  const availableLeads = leads.filter(l => l.status !== 'CLOSED_WON' && l.status !== 'CLOSED_LOST')

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId)
    if (lead) {
      setFormData({
        ...formData,
        selectedLeadId: leadId,
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone || '',
        budget: lead.budget?.toString() || '',
        location: lead.preferredArea || '',
        title: `Quality ${lead.source.replace('_', ' ')} Lead - ${lead.preferredArea || 'Various Areas'}`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 25,
          location: formData.location,
          propertyType: formData.propertyType,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          leadName: formData.leadName,
          leadEmail: formData.leadEmail,
          leadPhone: formData.leadPhone || null,
          leadNotes: formData.leadNotes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create listing')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-dark">Sell a Lead</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-primary-dark/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 border border-red-200 rounded-xl bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {availableLeads.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Select from existing leads (optional)</label>
              <select
                value={formData.selectedLeadId}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className="input-glass"
              >
                <option value="">-- Enter manually --</option>
                {availableLeads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} - {lead.email}</option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-primary/10 pt-4">
            <p className="text-xs font-medium text-primary-dark/40 uppercase tracking-wider mb-3">Listing Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-glass" placeholder="e.g. Hot Buyer Lead in Miami" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-glass resize-none" rows={2} placeholder="Brief description of the lead quality..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Price ($) *</label>
                  <input type="number" min="5" max="500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-glass" placeholder="25" required />
                  <p className="text-xs text-primary-dark/40 mt-1">$5 - $500</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Location *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-glass" placeholder="e.g. Miami, FL" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Property Type</label>
                  <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="input-glass">
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="LAND">Land</option>
                    <option value="MULTI_FAMILY">Multi-Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Budget Range ($)</label>
                  <div className="flex gap-2">
                    <input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input-glass" placeholder="Min" />
                    <input type="number" value={formData.budgetMax} onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })} className="input-glass" placeholder="Max" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-4">
            <p className="text-xs font-medium text-primary-dark/40 uppercase tracking-wider mb-3">Lead Contact Info (Private until purchased)</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Lead Name *</label>
                  <input type="text" value={formData.leadName} onChange={(e) => setFormData({ ...formData, leadName: e.target.value })} className="input-glass" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Lead Email *</label>
                  <input type="email" value={formData.leadEmail} onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })} className="input-glass" placeholder="john@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Lead Phone</label>
                <input type="tel" value={formData.leadPhone} onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })} className="input-glass" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Notes for buyer</label>
                <textarea value={formData.leadNotes} onChange={(e) => setFormData({ ...formData, leadNotes: e.target.value })} className="input-glass resize-none" rows={2} placeholder="Any additional info for the buyer..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} className="btn-glass flex-1 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'List for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
