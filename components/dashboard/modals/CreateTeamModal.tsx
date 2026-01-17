'use client'

import { useState } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'

interface CreateTeamModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.upgradeRequired) {
          throw new Error('Team feature requires Professional or Enterprise plan. Please upgrade to continue.')
        }
        throw new Error(data.error || 'Failed to create team')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md border border-gray-200 rounded bg-white animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Create Team</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 border border-red-200 rounded bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Team Name *</label>
            <input
              type="text"
              required
              minLength={2}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="My Real Estate Team"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={3}
              placeholder="A brief description of your team..."
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="border border-gray-200 rounded bg-white hover:border-gray-300 px-4 py-2.5 flex-1 cursor-pointer transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
