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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md border border-gray-200 rounded bg-white animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Document Name *</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Lease Agreement" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL *</label>
            <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input">
                <option value="CONTRACT">Contract</option>
                <option value="LEASE">Lease</option>
                <option value="INSPECTION">Inspection</option>
                <option value="INSURANCE">Insurance</option>
                <option value="TAX">Tax</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">File Size</label>
              <input type="text" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="e.g., 2.5 MB" className="input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Property (optional)</label>
            <select value={formData.propertyId} onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })} className="input">
              <option value="">-- None --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="border border-gray-200 rounded bg-white hover:border-gray-300 px-4 py-2.5 flex-1 cursor-pointer transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 cursor-pointer">
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
