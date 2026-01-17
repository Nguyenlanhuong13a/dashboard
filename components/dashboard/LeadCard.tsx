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

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'New', color: 'border-blue-200 text-blue-700' },
  CONTACTED: { label: 'Contacted', color: 'border-gray-200 text-gray-700' },
  QUALIFIED: { label: 'Qualified', color: 'border-green-200 text-green-700' },
  SHOWING: { label: 'Showing', color: 'border-purple-200 text-purple-700' },
  NEGOTIATING: { label: 'Negotiating', color: 'border-amber-200 text-amber-700' },
  CLOSED_WON: { label: 'Won', color: 'border-green-200 text-green-700' },
  CLOSED_LOST: { label: 'Lost', color: 'border-gray-200 text-gray-400' },
}

const priorityConfig: Record<string, { color: string }> = {
  LOW: { color: 'bg-gray-300' },
  MEDIUM: { color: 'bg-blue-400' },
  HIGH: { color: 'bg-amber-400' },
  URGENT: { color: 'bg-red-400' },
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
    <div className="border border-gray-200 rounded p-4 hover:border-gray-300 transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full ${priority.color}`} title={`${lead.priority} priority`} />
          <div>
            <h3 className="font-medium text-primary text-sm">{lead.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{lead.source.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border bg-white ${status.color}`}>
            {status.label}
          </span>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Lead options"
              aria-expanded={showMenu}
              className="p-1 rounded text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded py-1 z-20 animate-fade-in">
                <button
                  onClick={() => { onEdit(lead); setShowMenu(false) }}
                  className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Edit lead
                </button>
                <div className="border-t border-gray-100 my-1" />
                <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { onStatusChange(lead.id, key); setShowMenu(false) }}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                      lead.status === key
                        ? 'bg-gray-50 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
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
      <div className="space-y-1.5 mb-3">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
        >
          <Mail className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          <span className="truncate">{lead.email}</span>
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>{lead.phone}</span>
          </a>
        )}
      </div>

      {/* Meta info */}
      {(lead.budget || lead.preferredArea) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {lead.budget && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded">
              <DollarSign className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="tabular-nums">{new Intl.NumberFormat('en-US').format(lead.budget)}</span>
            </span>
          )}
          {lead.preferredArea && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-2 py-1 rounded">
              <MapPin className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span>{lead.preferredArea}</span>
            </span>
          )}
        </div>
      )}

      {/* Follow up */}
      {lead.nextFollowUp && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>Follow up: {formatDate(lead.nextFollowUp)}</span>
          </div>
        </div>
      )}

      {/* AI Score */}
      <div className={`pt-3 ${lead.nextFollowUp ? '' : 'border-t border-gray-100'}`}>
        <div className="flex items-center justify-between">
          {lead.score !== undefined && lead.score !== null ? (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">AI Score:</span>
                <span className={`text-sm font-semibold ${
                  lead.score >= 80 ? 'text-green-600' :
                  lead.score >= 60 ? 'text-blue-600' :
                  lead.score >= 40 ? 'text-amber-600' :
                  'text-gray-500'
                }`}>
                  {lead.score}
                </span>
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      lead.score >= 80 ? 'bg-green-500' :
                      lead.score >= 60 ? 'bg-blue-500' :
                      lead.score >= 40 ? 'bg-amber-500' :
                      'bg-gray-300'
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
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
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
