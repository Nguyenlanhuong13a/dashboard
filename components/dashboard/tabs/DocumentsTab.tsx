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
        <div className="border border-gray-200 rounded bg-white p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-amber-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Document limit reached</p>
              <p className="text-xs text-gray-500">Upgrade your plan to upload more documents</p>
            </div>
          </div>
          <button
            onClick={onNavigateToSettings}
            className="px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-sm font-medium hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-gray-900">
          Documents <span className="text-gray-400">({documents.length})</span>
        </h2>
        <button
          onClick={() => canAdd ? onAddDocument() : onNavigateToSettings()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition-all cursor-pointer ${
            canAdd
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          {canAdd ? <Upload className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
          {canAdd ? 'Upload' : 'Upgrade to Upload'}
        </button>
      </div>

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" action={onAddDocument} actionLabel="Upload Document" />
      ) : (
        <div className="border border-gray-200 rounded bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Size</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-5 py-3 text-gray-900">{d.name}</td>
                  <td className="px-5 py-3 text-gray-600">{d.category}</td>
                  <td className="px-5 py-3 text-gray-500">{d.property?.title || '-'}</td>
                  <td className="px-5 py-3 text-gray-500">{d.size}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
