'use client'

import { MoreHorizontal, Mail, Phone, Calendar, DollarSign, MapPin, Brain, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string
  status: string
  priority: string
  budget: number | null
  preferredArea: string | null
  nextFollowUp: string | null
  createdAt: string
  property?: { id: string; title: string; address: string } | null
  score?: number | null
}

interface LeadCardProps {
  lead: Lead
  onStatusChange: (id: string, status: string) => void
  onEdit: (lead: Lead) => void
  onScore?: (id: string) => Promise<void>
}

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  NEW: { label: 'New', color: 'text-primary', border: 'border-primary/30' },
  CONTACTED: { label: 'Contacted', color: 'text-accent', border: 'border-accent/30' },
  QUALIFIED: { label: 'Qualified', color: 'text-primary', border: 'border-primary/30' },
  SHOWING: { label: 'Showing', color: 'text-accent', border: 'border-accent/30' },
  NEGOTIATING: { label: 'Negotiating', color: 'text-accent-gold', border: 'border-accent-gold/30' },
  CLOSED_WON: { label: 'Won', color: 'text-primary', border: 'border-primary/40' },
  CLOSED_LOST: { label: 'Lost', color: 'text-primary-dark/40', border: 'border-primary-dark/20' },
}

const priorityConfig: Record<string, { color: string }> = {
  LOW: { color: 'bg-primary-200' },
  MEDIUM: { color: 'bg-primary-400' },
  HIGH: { color: 'bg-accent' },
  URGENT: { color: 'bg-accent-gold' },
}

export function LeadCard({ lead, onStatusChange, onEdit, onScore }: LeadCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [scoring, setScoring] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleScore = async () => {
    if (!onScore || scoring) return
    setScoring(true)
    try {
      await onScore(lead.id)
    } finally {
      setScoring(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateStr))
  }

  const status = statusConfig[lead.status] || statusConfig.NEW
  const priority = priorityConfig[lead.priority] || priorityConfig.MEDIUM

  return (
    <div className="glass-card-hover p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-10 rounded-full ${priority.color}`} title={`${lead.priority} priority`} />
          <div>
            <h3 className="font-semibold text-primary-dark">{lead.name}</h3>
            <p className="text-xs text-primary-dark/50 capitalize">{lead.source.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${status.color} ${status.border}`}>
            {status.label}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Lead options"
              aria-expanded={showMenu}
              className="p-1.5 rounded-lg text-primary-dark/40 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 glass-card py-2 z-20 animate-fade-in">
                <button
                  onClick={() => { onEdit(lead); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-primary-dark/80 hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  Edit lead
                </button>
                <div className="border-t border-primary/5 my-1.5" />
                <p className="px-4 py-1.5 text-xs font-medium text-primary-dark/40 uppercase tracking-wider">Status</p>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { onStatusChange(lead.id, key); setShowMenu(false) }}
                    className={`w-full px-4 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                      lead.status === key
                        ? 'bg-primary/5 text-primary font-medium'
                        : 'text-primary-dark/70 hover:bg-primary/5'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 text-sm text-primary-dark/70 hover:text-primary transition-colors"
        >
          <Mail className="h-4 w-4 text-primary/40" aria-hidden="true" />
          <span className="truncate">{lead.email}</span>
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 text-sm text-primary-dark/70 hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 text-primary/40" aria-hidden="true" />
            <span>{lead.phone}</span>
          </a>
        )}
      </div>

      {/* Meta info */}
      {(lead.budget || lead.preferredArea) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {lead.budget && (
            <span className="inline-flex items-center gap-1 text-xs text-primary-dark/70 border border-primary/20 px-2.5 py-1.5 rounded-lg">
              <DollarSign className="h-3 w-3 text-primary/50" aria-hidden="true" />
              <span className="tabular-nums">{new Intl.NumberFormat('en-US').format(lead.budget)}</span>
            </span>
          )}
          {lead.preferredArea && (
            <span className="inline-flex items-center gap-1 text-xs text-primary-dark/70 border border-primary/20 px-2.5 py-1.5 rounded-lg">
              <MapPin className="h-3 w-3 text-primary/50" aria-hidden="true" />
              <span>{lead.preferredArea}</span>
            </span>
          )}
        </div>
      )}

      {/* Follow up */}
      {lead.nextFollowUp && (
        <div className="pt-3 border-t border-primary/5">
          <div className="flex items-center gap-2 text-xs text-primary-dark/60">
            <Calendar className="h-3.5 w-3.5 text-primary/40" aria-hidden="true" />
            <span>Follow up: {formatDate(lead.nextFollowUp)}</span>
          </div>
        </div>
      )}

      {/* AI Score */}
      <div className={`pt-3 ${lead.nextFollowUp ? '' : 'border-t border-primary/5'}`}>
        <div className="flex items-center justify-between">
          {lead.score !== undefined && lead.score !== null ? (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary/50" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-primary-dark/80">AI Score:</span>
                <span className={`text-sm font-bold ${
                  lead.score >= 80 ? 'text-primary' :
                  lead.score >= 60 ? 'text-primary-light' :
                  lead.score >= 40 ? 'text-accent' :
                  'text-primary-dark/50'
                }`}>
                  {lead.score}
                </span>
                <div className="w-16 h-1.5 border border-primary/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      lead.score >= 80 ? 'bg-primary' :
                      lead.score >= 60 ? 'bg-primary-light' :
                      lead.score >= 40 ? 'bg-accent' :
                      'bg-primary-dark/30'
                    }`}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
              </div>
            </div>
          ) : onScore ? (
            <button
              onClick={handleScore}
              disabled={scoring}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-light transition-colors disabled:opacity-50 cursor-pointer"
            >
              {scoring ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Brain className="h-3.5 w-3.5" />
              )}
              {scoring ? 'Scoring...' : 'Get AI Score'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
