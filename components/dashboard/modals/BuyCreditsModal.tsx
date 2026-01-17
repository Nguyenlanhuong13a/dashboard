'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface BuyCreditsModalProps {
  onClose: () => void
}

export function BuyCreditsModal({ onClose }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'LEAD' | 'AI' | 'EMAIL'>('LEAD')
  const [selectedAmount, setSelectedAmount] = useState<number>(10)

  const creditPackages = {
    LEAD: [
      { amount: 10, price: 25, popular: false },
      { amount: 25, price: 50, popular: true },
      { amount: 50, price: 90, popular: false },
      { amount: 100, price: 150, popular: false },
    ],
    AI: [
      { amount: 50, price: 10, popular: false },
      { amount: 100, price: 18, popular: true },
      { amount: 250, price: 40, popular: false },
    ],
    EMAIL: [
      { amount: 500, price: 15, popular: false },
      { amount: 1000, price: 25, popular: true },
      { amount: 2500, price: 50, popular: false },
    ],
  }

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, amount: selectedAmount }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process purchase')
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process purchase')
    } finally {
      setLoading(false)
    }
  }

  const packages = creditPackages[selectedType]
  const selectedPackage = packages.find(p => p.amount === selectedAmount) || packages[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg border border-gray-200 rounded bg-white animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Buy Credits</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Close"><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Credit Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['LEAD', 'AI', 'EMAIL'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setSelectedAmount(creditPackages[type][0].amount) }}
                  className={`px-3 py-2 text-sm font-medium rounded border transition-colors cursor-pointer ${
                    selectedType === type
                      ? 'border-gray-900 text-gray-900 bg-gray-100'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type === 'LEAD' ? 'Lead Credits' : type === 'AI' ? 'AI Credits' : 'Email Credits'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Select Package</label>
            <div className="grid grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedAmount(pkg.amount)}
                  className={`relative p-4 rounded border transition-all cursor-pointer ${
                    selectedAmount === pkg.amount
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="font-display text-2xl font-semibold text-gray-900">{pkg.amount}</div>
                  <div className="text-xs text-gray-500">credits</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">${pkg.price}</div>
                  <div className="text-xs text-gray-400">${(pkg.price / pkg.amount).toFixed(2)}/credit</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-display text-xl font-semibold text-gray-900">${selectedPackage.price}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedPackage.amount} {selectedType.toLowerCase()} credits
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="border border-gray-200 rounded bg-white hover:border-gray-300 px-4 py-2.5 flex-1 cursor-pointer transition-colors">Cancel</button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : 'Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
