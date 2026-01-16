'use client'

import { Home, Plus, Crown, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { PropertyCard } from '@/components/dashboard/PropertyCard'
import { EmptyState } from '@/components/dashboard/shared'

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  price: number
  monthlyRent: number
  listingType: string
  propertyType: string
  beds: number
  baths: number
  sqft: number
  image: string | null
  featured: boolean
  capRate: number
}

interface PropertiesTabProps {
  properties: Property[]
  favorites: Set<string>
  canAdd: boolean
  onToggleFavorite: (id: string) => void
  onAddProperty: () => void
  onEditProperty: (property: Property) => void
  onDeleteProperty: (id: string) => void
  onNavigateToSettings: () => void
}

export function PropertiesTab({
  properties,
  favorites,
  canAdd,
  onToggleFavorite,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onNavigateToSettings,
}: PropertiesTabProps) {
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
              <p className="text-sm font-medium text-primary-dark">Property limit reached</p>
              <p className="text-xs text-primary-dark/60">Upgrade your plan to add more properties</p>
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
          All Properties <span className="text-primary-dark/50">({properties.length})</span>
        </h2>
        <button
          onClick={() => canAdd ? onAddProperty() : onNavigateToSettings()}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            canAdd
              ? 'bg-primary text-white hover:bg-primary-light hover:shadow-glow'
              : 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20 hover:bg-accent-gold/20'
          }`}
        >
          {canAdd ? <Plus className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
          {canAdd ? 'Add Property' : 'Upgrade to Add'}
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState icon={Home} title="No properties found" action={onAddProperty} actionLabel="Add Property" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="relative group">
              <PropertyCard property={property} onFavorite={onToggleFavorite} isFavorite={favorites.has(property.id)} />
              <div className="absolute top-14 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onEditProperty(property)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-white transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 text-primary-dark/70" />
                </button>
                <button
                  onClick={() => onDeleteProperty(property.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-soft hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
