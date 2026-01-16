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
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl floating" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl floating" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-primary-dark">RealEstate Pro</span>
        </div>

        {/* Main Content */}
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-semibold text-primary-dark leading-tight mb-4">
            Manage your portfolio with{' '}
            <span className="text-gradient">clarity</span>
          </h1>
          <p className="text-lg text-primary-dark/70 mb-10 leading-relaxed">
            Track properties, leads, and transactions in one place. Built for real estate professionals who value simplicity and elegance.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mb-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card px-5 py-4 flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display text-xl font-semibold text-primary-dark">{stat.value}</div>
                  <div className="text-sm text-primary-dark/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="glass-card p-6">
            <Quote className="w-6 h-6 text-primary/30 mb-3" />
            <p className="text-primary-dark/80 mb-4 text-lg leading-relaxed">"{testimonial.quote}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{testimonial.avatar}</span>
                </div>
                <div>
                  <div className="font-medium text-primary-dark">{testimonial.name}</div>
                  <div className="text-sm text-primary-dark/60">{testimonial.role}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentTestimonial ? 'bg-primary w-6' : 'bg-primary/20 w-1.5 hover:bg-primary/40'
                    }`}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-primary-dark/50">
          Trusted by 500+ real estate professionals worldwide
        </div>
      </div>
    </div>
  )
}
