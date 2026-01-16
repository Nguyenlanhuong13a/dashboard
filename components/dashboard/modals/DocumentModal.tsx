'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface DocumentModalProps {
  properties: { id: string; title: string }[]
  onClose: () => void
  onSuccess: () => void
}

export function DocumentModal({ properties, onClose, onSuccess }: DocumentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'application/pdf',
    size: '',
    url: '',
    category: 'CONTRACT',
    propertyId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, propertyId: formData.propertyId || null }),
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
          <h2 className="font-display text-lg font-semibold text-primary-dark">Upload Document</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-primary-dark/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Document Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Lease Agreement" className="input-glass" />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">URL *</label>
            <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." className="input-glass" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-glass">
                <option value="CONTRACT">Contract</option>
                <option value="LEASE">Lease</option>
                <option value="INSPECTION">Inspection</option>
                <option value="INSURANCE">Insurance</option>
                <option value="TAX">Tax</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">File Size</label>
              <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g., 2.5 MB" className="input-glass" />
            </div>
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
          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} className="btn-glass flex-1 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 cursor-pointer">
              {loading ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
