'use client'

import { Plus } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  action: () => void
  actionLabel: string
}

export function EmptyState({ icon: Icon, title, action, actionLabel }: EmptyStateProps) {
  return (
    <div className="text-center py-16 glass-card">
      <div className="flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="font-display text-sm font-semibold text-primary-dark mb-1">{title}</h3>
      <p className="text-sm text-primary-dark/50 mb-5">Get started by adding your first item</p>
      <button
        onClick={action}
        className="btn-primary inline-flex items-center gap-2 cursor-pointer"
      >
        <Plus className="h-4 w-4" /> {actionLabel}
      </button>
    </div>
  )
}
