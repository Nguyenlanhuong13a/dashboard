'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PropertyModalProps {
  property?: {
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
  }
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export function PropertyModal({ property, userId, onClose, onSuccess }: PropertyModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: property?.title || '',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zipCode: '',
    price: property?.price?.toString() || '',
    monthlyRent: property?.monthlyRent?.toString() || '',
    listingType: property?.listingType === 'FOR_RENT' ? 'For Rent' : 'For Sale',
    propertyType: property?.propertyType ? property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase() : 'Residential',
    beds: property?.beds?.toString() || '',
    baths: property?.baths?.toString() || '',
    sqft: property?.sqft?.toString() || '',
    yearBuilt: '',
    image: property?.image || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = property ? `/api/properties/${property.id}` : '/api/properties'
      const method = property ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          price: parseFloat(formData.price) || 0,
          monthlyRent: parseFloat(formData.monthlyRent) || 0,
          beds: parseInt(formData.beds) || 0,
          baths: parseFloat(formData.baths) || 0,
          sqft: parseInt(formData.sqft) || 0,
          yearBuilt: parseInt(formData.yearBuilt) || null,
        }),
      })

      if (!res.ok) throw new Error('Failed')
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 rounded bg-white animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">{property ? 'Edit Property' : 'Add Property'}</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Close">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input" placeholder="Property name" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" placeholder="Street address" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
              <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="input" placeholder="Miami" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
              <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="input" placeholder="FL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Listing Type</label>
              <select value={formData.listingType} onChange={(e) => setFormData({ ...formData, listingType: e.target.value })} className="input">
                <option>For Sale</option>
                <option>For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Property Type</label>
              <select value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="input">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Luxury</option>
                <option>Vacation</option>
                <option>Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price ($)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly Rent ($)</label>
              <input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Beds</label>
              <input type="number" value={formData.beds} onChange={(e) => setFormData({ ...formData, beds: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Baths</label>
              <input type="number" step="0.5" value={formData.baths} onChange={(e) => setFormData({ ...formData, baths: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sqft</label>
              <input type="number" value={formData.sqft} onChange={(e) => setFormData({ ...formData, sqft: e.target.value })} className="input" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Year Built</label>
              <input type="number" value={formData.yearBuilt} onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })} className="input" placeholder="2024" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Image URL</label>
              <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="input" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="border border-gray-200 rounded bg-white hover:border-gray-300 px-4 py-2.5 flex-1 cursor-pointer transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving...' : property ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
