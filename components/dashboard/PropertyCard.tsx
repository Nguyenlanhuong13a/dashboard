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
    <div className="border border-gray-200 rounded overflow-hidden hover:border-gray-300 transition-colors cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {property.image ? (
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-300" aria-hidden="true" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium px-2 py-1 rounded border ${
            isRental
              ? 'border-blue-200 text-blue-700 bg-white'
              : 'border-gray-200 text-gray-700 bg-white'
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
          className={`absolute top-3 right-3 p-2 rounded border transition-colors cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${isFavorite
              ? 'border-red-200 text-red-500 bg-white'
              : 'border-gray-200 text-gray-400 bg-white hover:text-red-500 hover:border-red-200'
            }`}
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="font-display text-lg font-semibold text-primary tabular-nums">
            {isRental ? `${formatPrice(property.monthlyRent)}` : formatPrice(property.price)}
            {isRental && <span className="text-sm font-sans font-normal text-gray-500">/mo</span>}
          </p>
          {property.capRate > 0 && (
            <span className="text-xs font-medium text-gray-600 border border-gray-200 px-2 py-0.5 rounded tabular-nums">
              {property.capRate.toFixed(1)}% cap
            </span>
          )}
        </div>

        <h3 className="font-medium text-primary text-sm line-clamp-1 mb-2">{property.title}</h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="line-clamp-1">{property.city}, {property.state}</span>
        </div>

        {/* Property details */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Bed className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className="tabular-nums">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Bath className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className="tabular-nums">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Maximize className="h-4 w-4 text-gray-400" aria-hidden="true" />
            <span className="tabular-nums">{property.sqft?.toLocaleString()}</span>
            <span className="text-gray-400">ft²</span>
          </div>
        </div>
      </div>
    </div>
  )
}
