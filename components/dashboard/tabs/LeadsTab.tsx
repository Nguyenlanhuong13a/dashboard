'use client'

import { Users, UserPlus, Crown, AlertCircle, Trash2 } from 'lucide-react'
import { LeadCard } from '@/components/dashboard/LeadCard'
import { EmptyState } from '@/components/dashboard/shared'

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
  notes?: string
  createdAt: string
  property?: { id: string; title: string; address: string } | null
  score?: number | null
}

interface LeadsTabProps {
  leads: Lead[]
  leadStats: Record<string, number>
  canAdd: boolean
  onAddLead: () => void
  onEditLead: (lead: Lead) => void
  onDeleteLead: (id: string) => void
  onStatusChange: (id: string, status: string) => Promise<void>
  onScoreLead: (id: string) => Promise<void>
  onNavigateToSettings: () => void
}

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'SHOWING', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']

export function LeadsTab({
  leads,
  leadStats,
  canAdd,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onStatusChange,
  onScoreLead,
  onNavigateToSettings,
}: LeadsTabProps) {
  return (
    <div className="space-y-5">
      {/* Limit Warning */}
      {!canAdd && (
        <div className="glass-card p-4 border-l-4 border-accent-gold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-accent-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-dark">Lead limit reached</p>
              <p className="text-xs text-primary-dark/60">Upgrade your plan to add more leads</p>
            </div>
          </div>
          <button
            onClick={onNavigateToSettings}
            className="px-4 py-2 bg-accent-gold/10 text-accent-gold border border-accent-gold/20 rounded-xl text-sm font-medium hover:bg-accent-gold/20 transition-colors cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Status Stats */}
      <div className="flex flex-wrap gap-3">
        {LEAD_STATUSES.map((status) => (
          <div key={status} className="glass-card px-4 py-2.5 flex items-center gap-2">
            <span className="font-display font-semibold text-primary-dark">{leadStats[status] || 0}</span>
            <span className="text-xs text-primary-dark/60 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="font-display text-sm font-semibold text-primary-dark">
          All Leads <span className="text-primary-dark/50">({leads.length})</span>
        </h2>
        <button
          onClick={() => canAdd ? onAddLead() : onNavigateToSettings()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            canAdd
              ? 'bg-primary text-white hover:bg-primary-light hover:shadow-glow'
              : 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/20'
          }`}
        >
          {canAdd ? <UserPlus className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
          {canAdd ? 'Add Lead' : 'Upgrade to Add'}
        </button>
      </div>

      {leads.length === 0 ? (
        <EmptyState icon={Users} title="No leads yet" action={onAddLead} actionLabel="Add Lead" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="relative group">
              <LeadCard
                lead={lead}
                onStatusChange={onStatusChange}
                onEdit={() => onEditLead(lead)}
                onScore={onScoreLead}
              />
              <button
                onClick={() => onDeleteLead(lead.id)}
                className="absolute top-3 right-14 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
