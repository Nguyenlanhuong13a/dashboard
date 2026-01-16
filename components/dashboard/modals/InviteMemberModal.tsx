'use client'

import { useState } from 'react'
import { X, AlertCircle, Check, Loader2 } from 'lucide-react'

interface InviteMemberModalProps {
  teamId: string
  onClose: () => void
  onSuccess: () => void
}

export function InviteMemberModal({ teamId, onClose, onSuccess }: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ email: '', role: 'MEMBER' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(true)
      setFormData({ email: '', role: 'MEMBER' })
      onSuccess()

      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-dark">Invite Team Member</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-primary-dark/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 border border-red-200 rounded-xl bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 border border-primary/20 rounded-xl bg-primary/5 flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-primary">Invitation sent successfully!</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-glass"
              placeholder="colleague@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-primary-dark/60 mb-1.5">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-glass"
            >
              <option value="MEMBER">Member - Can view and edit</option>
              <option value="ADMIN">Admin - Can manage members</option>
              <option value="VIEWER">Viewer - Read-only access</option>
            </select>
          </div>
          <p className="text-xs text-primary-dark/50">An invitation link will be sent to this email address. The invite expires in 7 days.</p>
          <div className="flex gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} className="btn-glass flex-1 cursor-pointer">Cancel</button>
            <button type="submit" disabled={loading || success} className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
