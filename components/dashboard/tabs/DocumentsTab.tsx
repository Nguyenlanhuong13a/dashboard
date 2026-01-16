'use client'

import { FileText, Upload, Crown, AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/shared'

interface Document {
  id: string
  name: string
  type: string
  size: string
  url: string
  category: string
  createdAt: string
  property?: { id: string; title: string } | null
}

interface DocumentsTabProps {
  documents: Document[]
  canAdd: boolean
  onAddDocument: () => void
  onNavigateToSettings: () => void
}

export function DocumentsTab({ documents, canAdd, onAddDocument, onNavigateToSettings }: DocumentsTabProps) {
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
              <p className="text-sm font-medium text-primary-dark">Document limit reached</p>
              <p className="text-xs text-primary-dark/60">Upgrade your plan to upload more documents</p>
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

      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-primary-dark">
          Documents <span className="text-primary-dark/50">({documents.length})</span>
        </h2>
        <button
          onClick={() => canAdd ? onAddDocument() : onNavigateToSettings()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            canAdd
              ? 'bg-primary text-white hover:bg-primary-light hover:shadow-glow'
              : 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/20'
          }`}
        >
          {canAdd ? <Upload className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
          {canAdd ? 'Upload' : 'Upgrade to Upload'}
        </button>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" action={onAddDocument} actionLabel="Upload Document" />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Name</th>
                <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Category</th>
                <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Property</th>
                <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Size</th>
                <th className="text-left px-5 py-3 font-medium text-primary-dark/70">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-primary/5 transition-colors cursor-pointer">
                  <td className="px-5 py-3 text-primary-dark">{d.name}</td>
                  <td className="px-5 py-3 text-primary-dark/70">{d.category}</td>
                  <td className="px-5 py-3 text-primary-dark/60">{d.property?.title || '-'}</td>
                  <td className="px-5 py-3 text-primary-dark/60">{d.size}</td>
                  <td className="px-5 py-3 text-primary-dark/60">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
