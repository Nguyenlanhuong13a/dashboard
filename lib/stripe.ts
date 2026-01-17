import Stripe from 'stripe'

// Lazy-init Stripe to avoid build errors when API key is not set
let stripeInstance: Stripe | null = null
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Keep backward compatibility
export const stripe = {
  get checkout() { return getStripe().checkout },
  get subscriptions() { return getStripe().subscriptions },
  get customers() { return getStripe().customers },
  get webhooks() { return getStripe().webhooks },
}

export const STRIPE_PRICES = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
}

// Validate Stripe prices are configured
export function validateStripePrices() {
  const missing = Object.entries(STRIPE_PRICES)
    .filter(([, value]) => !value)
    .map(([key]) => `STRIPE_PRICE_${key}`)

  if (missing.length > 0) {
    console.warn(`Warning: Missing Stripe price IDs: ${missing.join(', ')}. Subscription creation will fail.`)
  }
  return missing.length === 0
}

export const PLAN_AMOUNTS = {
  FREE: 0,
  STARTER: 2900, // $29.00 in cents
  PROFESSIONAL: 7900, // $79.00 in cents
  ENTERPRISE: 19900, // $199.00 in cents
}

export type PlanType = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
