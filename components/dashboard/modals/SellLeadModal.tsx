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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 rounded bg-white animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Sell a Lead</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 border border-red-200 rounded bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {availableLeads.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Select from existing leads (optional)</label>
              <select
                value={formData.selectedLeadId}
                onChange={(e) => handleLeadSelect(e.target.value)}
                className="input"
              >
                <option value="">-- Enter manually --</option>
                {availableLeads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} - {lead.email}</option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Listing Details</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input" placeholder="e.g. Hot Buyer Lead in Miami" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input resize-none" rows={2} placeholder="Brief description of the lead quality..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Price ($) *</label>
                  <input type="number" min="5" max="500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input" placeholder="25" required />
                  <p className="text-xs text-gray-400 mt-1">$5 - $500</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Location *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input" placeholder="e.g. Miami, FL" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Property Type</label>
                  <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="input">
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="LAND">Land</option>
                    <option value="MULTI_FAMILY">Multi-Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Budget Range ($)</label>
                  <div className="flex gap-2">
                    <input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} className="input" placeholder="Min" />
                    <input type="number" value={formData.budgetMax} onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })} className="input" placeholder="Max" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Lead Contact Info (Private until purchased)</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Lead Name *</label>
                  <input type="text" value={formData.leadName} onChange={(e) => setFormData({ ...formData, leadName: e.target.value })} className="input" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Lead Email *</label>
                  <input type="email" value={formData.leadEmail} onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })} className="input" placeholder="john@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Lead Phone</label>
                <input type="tel" value={formData.leadPhone} onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })} className="input" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes for buyer</label>
                <textarea value={formData.leadNotes} onChange={(e) => setFormData({ ...formData, leadNotes: e.target.value })} className="input resize-none" rows={2} placeholder="Any additional info for the buyer..." />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="border border-gray-200 rounded bg-white hover:border-gray-300 px-4 py-2.5 flex-1 cursor-pointer transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'List for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
