'use client'

import { MapPin, Bed, Bath, Maximize, Heart, ImageIcon } from 'lucide-react'
import Image from 'next/image'

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
  capRate: number
  image: string | null
  featured: boolean
}

interface PropertyCardProps {
  property: Property
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function PropertyCard({ property, onFavorite, isFavorite }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
    return `$${price}`
  }

  const isRental = property.listingType === 'FOR_RENT'

  return (
    <div className="group glass-card overflow-hidden transition-all duration-300 hover:shadow-glass-lg cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-primary-50 overflow-hidden">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-primary/20" aria-hidden="true" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-[8px] ${
            isRental
              ? 'bg-accent/90 text-white'
              : 'bg-primary/90 text-white'
          }`}>
            {isRental ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite?.(property.id)
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-[8px] transition-all cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            ${isFavorite
              ? 'bg-red-500/90 text-white'
              : 'bg-white/80 text-primary-dark/60 hover:text-red-500 hover:bg-white/90'
            }`}
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <p className="font-display text-xl font-bold text-primary-dark tabular-nums">
            {isRental ? `${formatPrice(property.monthlyRent)}` : formatPrice(property.price)}
            {isRental && <span className="text-sm font-sans font-normal text-primary-dark/50">/mo</span>}
          </p>
          {property.capRate > 0 && (
            <span className="text-xs font-medium text-primary border border-primary/30 px-2.5 py-1 rounded-lg tabular-nums">
              {property.capRate.toFixed(1)}% cap
            </span>
          )}
        </div>

        <h3 className="font-semibold text-primary-dark text-sm line-clamp-1 mb-2">{property.title}</h3>

        <div className="flex items-center gap-1.5 text-sm text-primary-dark/60 mb-4">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" aria-hidden="true" />
          <span className="line-clamp-1">{property.city}, {property.state}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
          <div className="flex items-center gap-1.5 text-sm text-primary-dark/70">
            <Bed className="h-4 w-4 text-primary/50" aria-hidden="true" />
            <span className="tabular-nums">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-primary-dark/70">
            <Bath className="h-4 w-4 text-primary/50" aria-hidden="true" />
            <span className="tabular-nums">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-primary-dark/70">
            <Maximize className="h-4 w-4 text-primary/50" aria-hidden="true" />
            <span className="tabular-nums">{property.sqft?.toLocaleString()}</span>
            <span className="text-primary-dark/40">ft²</span>
          </div>
        </div>
      </div>
    </div>
  )
}
