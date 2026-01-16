/**
 * @fileoverview Dashboard Type Definitions
 *
 * Centralized type definitions for the dashboard application.
 * These types are shared across components, API routes, and utilities.
 */

// Navigation
export type TabId = 'dashboard' | 'properties' | 'leads' | 'analytics' | 'financial' | 'documents' | 'marketplace' | 'teams' | 'settings' | 'help'

// User & Authentication
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  phone?: string | null
  licenseNumber?: string | null
}

// Dashboard Statistics
export interface DashboardStats {
  totalProperties: number
  activeLeads: number
  monthlyRevenue: number
  portfolioValue: number
  propertyGrowth: number
  leadGrowth: number
  revenueGrowth: number
  portfolioGrowth: number
  leadsByStatus: { status: string; _count: number }[]
  recentTransactions: {
    id: string
    description: string
    amount: number
    type: string
    createdAt: string
  }[]
  topProperties: {
    id: string
    title: string
    price: number
    status: string
  }[]
  monthlyData: {
    month: string
    revenue: number
    leads: number
  }[]
}

// Property Management
export interface Property {
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
  capRate: number | null
  createdAt: string
  user?: { id: string; name: string | null }
  _count?: { favorites: number }
}

// Lead Management
export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  source: string
  priority: string
  budget: number | null
  preferredArea: string | null
  notes: string | null
  score: number | null
  createdAt: string
  lastContactedAt: string | null
}

// Financial Transactions
export interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  propertyId: string | null
  property?: { id: string; title: string } | null
}

// Document Management
export interface Document {
  id: string
  name: string
  type: string
  size: number
  url: string
  propertyId: string | null
  property?: { id: string; title: string } | null
  createdAt: string
}

// Subscription & Billing
export interface SubscriptionData {
  subscription: {
    id: string
    plan: string
    status: string
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  }
  usage: {
    properties: { current: number; limit: number }
    leads: { current: number; limit: number }
    documents: { current: number; limit: number }
  }
  plans: {
    name: string
    price: number
    limits: {
      properties: number
      leads: number
      documents: number
      teamMembers: number
    }
    current: boolean
  }[]
}

// Marketplace
export interface LeadListing {
  id: string
  title: string
  description: string | null
  price: number
  location: string
  propertyType: string
  budget: number | null
  budgetMax: number | null
  status: string
  createdAt: string
  seller: {
    id: string
    name: string | null
  }
}

// Team Management
export interface Team {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  members: TeamMember[]
  myRole?: string
  _count?: { members: number }
}

export interface TeamMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export interface TeamInvite {
  id: string
  email: string
  role: string
  expiresAt: string
}

// Credits System
export interface UserCredits {
  lead: number
  ai: number
  email: number
}

// Notification
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl?: string | null
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
