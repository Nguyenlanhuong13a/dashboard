'use client'

import { Store, Tag, ShoppingCart, Plus } from 'lucide-react'

interface LeadListing {
  id: string
  price: number
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED'
  description: string | null
  createdAt: string
  lead: {
    name: string
    source: string
    budget: number | null
    preferredArea: string | null
  }
  seller: {
    name: string | null
    email: string
  }
}

interface MarketplaceTabProps {
  listings: LeadListing[]
  myListings: LeadListing[]
  onSellLead: () => void
  onPurchase: (listingId: string, price: number) => Promise<void>
}

export function MarketplaceTab({ listings, myListings, onSellLead, onPurchase }: MarketplaceTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <Store className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-gray-900">{listings.length}</p>
              <p className="text-xs text-gray-500">Available Leads</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <Tag className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-gray-900">{myListings.length}</p>
              <p className="text-xs text-gray-500">My Listings</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-gray-900">{myListings.filter(l => l.status === 'SOLD').length}</p>
              <p className="text-xs text-gray-500">Leads Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Leads */}
      <div className="border border-gray-200 rounded bg-white">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Store className="h-4 w-4 text-gray-600" /> Available Leads
          </h2>
          <button
            onClick={onSellLead}
            className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 px-4 py-2 rounded text-xs font-medium cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Sell a Lead
          </button>
        </div>
        {listings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Store className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No leads available in the marketplace</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to list a lead for sale!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listings.map((listing) => (
              <div key={listing.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900">{listing.lead.name}</h3>
                      <span className="px-2.5 py-1 text-xs border border-gray-200 text-gray-600 rounded">
                        {listing.lead.source}
                      </span>
                    </div>
                    {listing.description && (
                      <p className="text-xs text-gray-500 mt-1">{listing.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {listing.lead.budget && (
                        <span>Budget: ${listing.lead.budget.toLocaleString()}</span>
                      )}
                      {listing.lead.preferredArea && (
                        <span>Area: {listing.lead.preferredArea}</span>
                      )}
                      <span>Seller: {listing.seller.name || listing.seller.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-gray-900">${listing.price}</p>
                    <button
                      onClick={() => onPurchase(listing.id, listing.price)}
                      className="mt-2 px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Listings */}
      {myListings.length > 0 && (
        <div className="border border-gray-200 rounded bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-display text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-600" /> My Listings
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {myListings.map((listing) => (
              <div key={listing.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900">{listing.lead.name}</h3>
                      <span className={`px-2.5 py-1 text-xs rounded border ${
                        listing.status === 'ACTIVE' ? 'border-gray-200 text-gray-600' :
                        listing.status === 'SOLD' ? 'border-gray-200 text-gray-500' :
                        'border-gray-100 text-gray-400'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Listed {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-gray-900">${listing.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
