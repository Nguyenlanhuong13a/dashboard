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
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-primary-dark">{listings.length}</p>
              <p className="text-xs text-primary-dark/60">Available Leads</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <Tag className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-primary-dark">{myListings.length}</p>
              <p className="text-xs text-primary-dark/60">My Listings</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-accent-gold" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-primary-dark">{myListings.filter(l => l.status === 'SOLD').length}</p>
              <p className="text-xs text-primary-dark/60">Leads Sold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Leads */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b border-primary/5 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-primary-dark flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" /> Available Leads
          </h2>
          <button
            onClick={onSellLead}
            className="btn-primary flex items-center gap-2 !px-4 !py-2 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Sell a Lead
          </button>
        </div>
        {listings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Store className="h-7 w-7 text-primary/40" />
            </div>
            <p className="text-sm text-primary-dark/60">No leads available in the marketplace</p>
            <p className="text-xs text-primary-dark/40 mt-1">Be the first to list a lead for sale!</p>
          </div>
        ) : (
          <div className="divide-y divide-primary/5">
            {listings.map((listing) => (
              <div key={listing.id} className="p-5 hover:bg-primary/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-primary-dark">{listing.lead.name}</h3>
                      <span className="px-2.5 py-1 text-xs border border-primary/30 text-primary rounded-lg">
                        {listing.lead.source}
                      </span>
                    </div>
                    {listing.description && (
                      <p className="text-xs text-primary-dark/60 mt-1">{listing.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-primary-dark/50">
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
                    <p className="font-display text-lg font-semibold text-primary-dark">${listing.price}</p>
                    <button
                      onClick={() => onPurchase(listing.id, listing.price)}
                      className="mt-2 px-4 py-2 text-xs font-medium text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
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
        <div className="glass-card">
          <div className="px-5 py-4 border-b border-primary/5">
            <h2 className="font-display text-sm font-semibold text-primary-dark flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> My Listings
            </h2>
          </div>
          <div className="divide-y divide-primary/5">
            {myListings.map((listing) => (
              <div key={listing.id} className="p-5 hover:bg-primary/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-primary-dark">{listing.lead.name}</h3>
                      <span className={`px-2.5 py-1 text-xs rounded-lg border ${
                        listing.status === 'ACTIVE' ? 'border-primary/30 text-primary' :
                        listing.status === 'SOLD' ? 'border-primary-dark/20 text-primary-dark/60' :
                        'border-primary-dark/10 text-primary-dark/40'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-xs text-primary-dark/50 mt-1">
                      Listed {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-primary-dark">${listing.price}</p>
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
