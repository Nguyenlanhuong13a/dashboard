'use client'

import { useState, useEffect } from 'react'
import { Building2, TrendingUp, Users, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Real Estate Broker',
    quote: 'Increased my closing rate by 40% in just 3 months.',
    avatar: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Property Manager',
    quote: 'Finally, one platform that handles everything.',
    avatar: 'MR',
  },
  {
    name: 'Emily Watson',
    role: 'Investment Analyst',
    quote: 'The analytics dashboard saved us countless hours.',
    avatar: 'EW',
  },
]

const STATS = [
  { label: 'Properties', value: '10,000+', icon: Building2 },
  { label: 'Volume', value: '$2.4B', icon: TrendingUp },
  { label: 'Agents', value: '500+', icon: Users },
]

export function LoginHero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const testimonial = TESTIMONIALS[currentTestimonial]

  return (
    <div className="hidden lg:flex lg:w-1/2 border-r border-gray-200">
      <div className="flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-primary" />
          <span className="font-display text-xl font-semibold text-primary">RealEstate Pro</span>
        </div>

        {/* Main Content */}
        <div className="max-w-md">
          <h1 className="font-display text-3xl font-semibold text-primary leading-tight mb-4">
            Manage your portfolio with clarity
          </h1>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Track properties, leads, and transactions in one place. Built for real estate professionals who value simplicity.
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-4 py-3 border border-gray-200 rounded flex items-center gap-3">
                <stat.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-display text-lg font-semibold text-primary">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="border border-gray-200 rounded p-5">
            <Quote className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${
                      i === currentTestimonial ? 'bg-primary w-4' : 'bg-gray-200 w-1 hover:bg-gray-300'
                    }`}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-400">
          Trusted by 500+ real estate professionals worldwide
        </div>
      </div>
    </div>
  )
}
