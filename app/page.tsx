/**
 * @fileoverview Main Dashboard Page Component
 *
 * This is the primary interface for the Real Estate Pro Dashboard application.
 * It provides a comprehensive property management system with the following features:
 *
 * - Property Management: Add, edit, delete and track properties
 * - Lead Management: Track potential clients with AI-powered scoring
 * - Financial Tracking: Monitor income, expenses, and commissions
 * - Document Storage: Organize property-related documents
 * - Marketplace: Buy and sell leads with other agents
 * - Team Collaboration: Create teams and invite members (Pro/Enterprise)
 * - Analytics: View performance metrics and charts
 *
 * Architecture:
 * - Uses React hooks for state management
 * - Implements lazy loading for modals
 * - Follows responsive design patterns with Tailwind CSS
 * - API calls use fetch with proper error handling
 *
 * @author Real Estate Pro Team
 * @version 2.0.0
 * @license MIT
 */

'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Building2,
  DollarSign,
  TrendingUp,
  Wallet,
  Target,
  Home,
  ArrowUpRight,
  Plus,
  X,
  Loader2,
  RefreshCw,
  Users,
  UserPlus,
  Pencil,
  Trash2,
  FileText,
  Upload,
  Crown,
  Zap,
  Check,
  AlertCircle,
  Mail,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Shield,
  CreditCard,
  User,
  Camera,
  Eye,
  EyeOff,
  Phone,
  BadgeCheck,
  Save,
  Store,
  UsersRound,
  ShoppingCart,
  Tag,
  Brain,
  Star,
} from 'lucide-react'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PropertyCard } from '@/components/dashboard/PropertyCard'
import { RevenueChart, PropertyTypeChart } from '@/components/dashboard/Charts'
import { LeadCard } from '@/components/dashboard/LeadCard'
import {
  PropertyModal,
  LeadModal,
  TransactionModal,
  DocumentModal,
  CreateTeamModal,
  InviteMemberModal,
  BuyCreditsModal,
  SellLeadModal,
} from '@/components/dashboard/modals'
import { EmptyState, UsageBar } from '@/components/dashboard/shared'
import {
  DashboardTab,
  PropertiesTab,
  LeadsTab,
  AnalyticsTab,
  FinancialTab,
  DocumentsTab,
  MarketplaceTab,
  TeamsTab,
  SettingsTab,
  HelpTab,
} from '@/components/dashboard/tabs'

type TabId = 'dashboard' | 'properties' | 'leads' | 'analytics' | 'financial' | 'documents' | 'marketplace' | 'teams' | 'settings' | 'help'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  phone?: string | null
  licenseNumber?: string | null
}

interface DashboardStats {
  overview: {
    totalProperties: number
    forSaleCount: number
    forRentCount: number
    occupiedCount: number
    vacancyRate: string | number
  }
  financials: {
    totalPortfolioValue: number
    totalMonthlyRent: number
    annualRent: number
    avgCapRate: string
    totalCommissions: number
    totalIncome: number
    totalExpenses: number
    netIncome: number
  }
  charts: {
    propertyTypeDistribution: Record<string, number>
    monthlyData: Array<{
      month: string
      properties: number
      income: number
      expenses: number
      revenue: number
    }>
  }
  recentTransactions: Array<{
    id: string
    type: string
    description: string
    amount: number
    date: string
    property: string
  }>
}

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode?: string
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
  yearBuilt?: number
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string
  status: string
  priority: string
  budget: number | null
  preferredArea: string | null
  nextFollowUp: string | null
  notes?: string
  createdAt: string
  property?: { id: string; title: string; address: string } | null
  score?: number | null
}

interface Transaction {
  id: string
  type: string
  description: string
  amount: number
  date: string
  propertyId: string | null
  property?: { id: string; title: string; address: string } | null
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  url: string
  category: string
  createdAt: string
  property?: { id: string; title: string } | null
}

interface SubscriptionData {
  subscription: {
    id: string
    plan: string
    status: string
    currentPeriodEnd: string
  }
  usage: {
    properties: { current: number; limit: number }
    leads: { current: number; limit: number }
    documents: { current: number; limit: number }
  }
  plans: Array<{
    name: string
    price: number
    limits: { properties: number; leads: number; documents: number; teamMembers: number }
    current: boolean
  }>
}

interface LeadListing {
  id: string
  leadId: string
  sellerId: string
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

interface Team {
  id: string
  name: string
  ownerId: string
  createdAt: string
  members: TeamMember[]
  invites: TeamInvite[]
}

interface TeamMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  joinedAt: string
  user: {
    name: string | null
    email: string
    image: string | null
  }
}

interface TeamInvite {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadStats, setLeadStats] = useState<Record<string, number>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [unreadCount, setUnreadCount] = useState(0)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [marketplaceListings, setMarketplaceListings] = useState<LeadListing[]>([])
  const [myListings, setMyListings] = useState<LeadListing[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)

  // Modal states
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false)
  const [showEditPropertyModal, setShowEditPropertyModal] = useState<Property | null>(null)
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [showEditLeadModal, setShowEditLeadModal] = useState<Lead | null>(null)
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [showEditTransactionModal, setShowEditTransactionModal] = useState<Transaction | null>(null)
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSellLeadModal, setShowSellLeadModal] = useState(false)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showInviteMemberModal, setShowInviteMemberModal] = useState<string | null>(null) // teamId
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false)

  // Profile edit states
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', licenseNumber: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const profileSaveTimeout = useRef<NodeJS.Timeout | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Password change states
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  // Handle payment return from Stripe with polling for webhook processing
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    let pollCount = 0
    let pollInterval: NodeJS.Timeout | null = null

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?session_id=${sessionId}`)
        const data = await res.json()

        if (data.status === 'COMPLETED') {
          if (pollInterval) clearInterval(pollInterval)
          setPaymentMessage({ type: 'success', text: `Payment successful! Your plan has been upgraded to ${data.plan}.` })
          fetchData()
        } else if (data.status === 'FAILED') {
          if (pollInterval) clearInterval(pollInterval)
          setPaymentMessage({ type: 'error', text: 'Payment failed. Please try again.' })
        } else if (pollCount >= 12) {
          // After 12 polls (60 seconds), stop and show message
          if (pollInterval) clearInterval(pollInterval)
          setPaymentMessage({ type: 'info', text: 'Payment is being processed. Please check back in a moment.' })
        } else {
          pollCount++
          setPaymentMessage({ type: 'info', text: `Processing payment... (${pollCount}/12)` })
        }
      } catch {
        if (pollCount >= 12 && pollInterval) {
          clearInterval(pollInterval)
          setPaymentMessage({ type: 'info', text: 'Payment received. Your plan will be updated shortly.' })
        }
        pollCount++
      }
    }

    if (payment === 'success' && sessionId) {
      setPaymentMessage({ type: 'info', text: 'Verifying payment...' })
      checkPaymentStatus()
      // Poll every 5 seconds for up to 60 seconds
      pollInterval = setInterval(checkPaymentStatus, 5000)
      router.replace('/', { scroll: false })
    } else if (payment === 'cancelled') {
      setPaymentMessage({ type: 'error', text: 'Payment was cancelled. No charges were made.' })
      router.replace('/', { scroll: false })
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [searchParams, router])

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const [statsRes, propertiesRes, leadsRes, transactionsRes, documentsRes, notifRes, subRes, marketplaceRes, teamsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/properties?limit=50'),
        fetch('/api/leads?limit=50'),
        fetch('/api/transactions?limit=50'),
        fetch('/api/documents?limit=50'),
        fetch('/api/notifications?unread=true&limit=1'),
        fetch('/api/subscription'),
        fetch('/api/marketplace'),
        fetch('/api/teams'),
      ])

      const [statsData, propertiesData, leadsData, transactionsData, documentsData, notifData, subData, marketplaceData, teamsData] = await Promise.all([
        statsRes.ok ? statsRes.json() : null,
        propertiesRes.ok ? propertiesRes.json() : { data: [] },
        leadsRes.ok ? leadsRes.json() : { data: [], stats: {} },
        transactionsRes.ok ? transactionsRes.json() : [],
        documentsRes.ok ? documentsRes.json() : [],
        notifRes.ok ? notifRes.json() : { unreadCount: 0 },
        subRes.ok ? subRes.json() : null,
        marketplaceRes.ok ? marketplaceRes.json() : { listings: [], myListings: [] },
        teamsRes.ok ? teamsRes.json() : [],
      ])

      if (statsData) setStats(statsData)
      setProperties(propertiesData.data || propertiesData)
      setLeads(leadsData.data || [])
      setLeadStats(leadsData.stats || {})
      setTransactions(transactionsData)
      setDocuments(documentsData.data || documentsData)
      setUnreadCount(notifData.unreadCount || 0)
      if (subData) setSubscriptionData(subData)
      setMarketplaceListings(marketplaceData.listings || [])
      setMyListings(marketplaceData.myListings || [])
      setTeams(teamsData.data || teamsData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  // Sync profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        licenseNumber: user.licenseNumber || '',
      })
    }
  }, [user])

  // Debounced profile save
  const saveProfile = useCallback(async (data: typeof profileForm) => {
    setProfileSaving(true)
    setProfileError(null)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        setProfileError(result.error || 'Failed to save')
        return
      }
      setUser(prev => prev ? { ...prev, ...result.user } : null)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch {
      setProfileError('Network error')
    } finally {
      setProfileSaving(false)
    }
  }, [])

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    const newForm = { ...profileForm, [field]: value }
    setProfileForm(newForm)
    setProfileSaved(false)
    setProfileError(null)

    // Debounce save
    if (profileSaveTimeout.current) clearTimeout(profileSaveTimeout.current)
    profileSaveTimeout.current = setTimeout(() => saveProfile(newForm), 800)
  }

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate client-side
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setProfileError('Invalid file type. Use JPEG, PNG, or WebP.')
      return
    }
    if (file.size > 500 * 1024) {
      setProfileError('File too large. Max 500KB.')
      return
    }

    setAvatarUploading(true)
    setProfileError(null)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (!res.ok) {
        setProfileError(result.error || 'Upload failed')
        return
      }
      setUser(prev => prev ? { ...prev, image: result.image } : null)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch {
      setProfileError('Upload failed')
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('Remove your profile photo?')) return
    setAvatarUploading(true)
    try {
      await fetch('/api/users/avatar', { method: 'DELETE' })
      setUser(prev => prev ? { ...prev, image: null } : null)
    } catch {
      setProfileError('Failed to remove avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  // Password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    if (passwordForm.new.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)
    setPasswordError(null)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
          confirmPassword: passwordForm.confirm,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setPasswordError(result.error || 'Failed to change password')
        return
      }
      setShowPasswordModal(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
      alert('Password changed successfully')
    } catch {
      setPasswordError('Network error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const toggleFavorite = async (propertyId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(propertyId)) newFavorites.delete(propertyId)
      else newFavorites.add(propertyId)
      return newFavorites
    })
    try {
      await fetch(`/api/properties/${propertyId}/favorite`, { method: 'POST' })
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  const deleteProperty = async (id: string) => {
    if (!confirm('Delete this property?')) return
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error('Error deleting property:', err)
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error('Error deleting lead:', err)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error('Error deleting transaction:', err)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const upgradePlan = async (plan: string) => {
    if (upgrading) return

    // For FREE plan (downgrade), use direct API
    if (plan === 'FREE') {
      setUpgrading(true)
      try {
        const res = await fetch('/api/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        if (res.ok) {
          setPaymentMessage({ type: 'success', text: 'Your plan has been changed to Free.' })
          fetchData()
        }
      } catch (err) {
        console.error('Error downgrading:', err)
        setPaymentMessage({ type: 'error', text: 'Failed to change plan. Please try again.' })
      } finally {
        setUpgrading(false)
      }
      return
    }

    // For paid plans, redirect to Stripe Checkout
    setUpgrading(true)
    setPaymentMessage(null)
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Error creating checkout:', err)
      setPaymentMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' })
      setUpgrading(false)
    }
    // Note: Don't setUpgrading(false) here - user will be redirected
  }

  const canAdd = (type: 'properties' | 'leads' | 'documents') => {
    if (!subscriptionData) return true
    const usage = subscriptionData.usage[type]
    return usage.limit === -1 || usage.current < usage.limit
  }

  const filteredProperties = properties.filter((p) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return p.title.toLowerCase().includes(query) || p.city.toLowerCase().includes(query) || p.address.toLowerCase().includes(query)
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-mesh">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={setMobileSidebarOpen}
      />

      <main className={`transition-all duration-300 ease-out ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}`}>
        <Header
          title={activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          user={user}
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
          onAddProperty={() => canAdd('properties') ? setShowAddPropertyModal(true) : setActiveTab('settings')}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadCount={unreadCount}
          subscription={subscriptionData ? { plan: subscriptionData.subscription.plan } : undefined}
          onUpgrade={() => setActiveTab('settings')}
        />

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-300 flex items-center justify-between">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={fetchData} className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm">
                <RefreshCw className="h-4 w-4" /> Retry
              </button>
            </div>
          )}

          {paymentMessage && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
              paymentMessage.type === 'success' ? 'border-green-300' :
              paymentMessage.type === 'error' ? 'border-red-300' :
              'border-blue-300'
            }`}>
              <div className="flex items-center gap-3">
                {paymentMessage.type === 'success' && <Check className="h-5 w-5 text-green-600" />}
                {paymentMessage.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {paymentMessage.type === 'info' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                <p className={`text-sm ${
                  paymentMessage.type === 'success' ? 'text-green-700' :
                  paymentMessage.type === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>{paymentMessage.text}</p>
              </div>
              <button
                onClick={() => setPaymentMessage(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Properties" value={stats.overview.totalProperties} change="+12%" changeType="up" icon={Building2} />
                <StatsCard title="Portfolio Value" value={formatCurrency(stats.financials.totalPortfolioValue)} change="+8.5%" changeType="up" icon={DollarSign} />
                <StatsCard title="Monthly Rent" value={formatCurrency(stats.financials.totalMonthlyRent)} change="+5%" changeType="up" icon={Wallet} />
                <StatsCard title="Avg. Cap Rate" value={`${stats.financials.avgCapRate}%`} change="+0.3%" changeType="up" icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={stats.charts.monthlyData} />
                <PropertyTypeChart data={stats.charts.propertyTypeDistribution} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Recent Properties</h2>
                  <button onClick={() => setActiveTab('properties')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    View All <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
                {filteredProperties.length === 0 ? (
                  <EmptyState icon={Home} title="No properties yet" action={() => setShowAddPropertyModal(true)} actionLabel="Add Property" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProperties.slice(0, 4).map((property) => (
                      <PropertyCard key={property.id} property={property} onFavorite={toggleFavorite} isFavorite={favorites.has(property.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {/* Limit Warning */}
              {subscriptionData && !canAdd('properties') && (
                <div className="p-4 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Property limit reached</p>
                      <p className="text-xs text-amber-600">Upgrade your plan to add more properties</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="px-3 py-1.5 border border-amber-400 text-amber-600 rounded text-sm font-medium hover:border-amber-500">
                    Upgrade Now
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">All Properties ({filteredProperties.length})</h2>
                <button
                  onClick={() => canAdd('properties') ? setShowAddPropertyModal(true) : setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    canAdd('properties') ? 'border-gray-900 text-gray-900' : 'border-amber-400 text-amber-600'
                  }`}
                >
                  {canAdd('properties') ? <Plus className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {canAdd('properties') ? 'Add Property' : 'Upgrade to Add'}
                </button>
              </div>
              {filteredProperties.length === 0 ? (
                <EmptyState icon={Home} title="No properties found" action={() => setShowAddPropertyModal(true)} actionLabel="Add Property" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="relative group">
                      <PropertyCard property={property} onFavorite={toggleFavorite} isFavorite={favorites.has(property.id)} />
                      <div className="absolute top-2 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setShowEditPropertyModal(property)} className="p-1.5 bg-white rounded shadow hover:bg-gray-50">
                          <Pencil className="h-3 w-3 text-gray-600" />
                        </button>
                        <button onClick={() => deleteProperty(property.id)} className="p-1.5 bg-white rounded shadow hover:text-red-500">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-5">
              {/* Limit Warning */}
              {subscriptionData && !canAdd('leads') && (
                <div className="p-4 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Lead limit reached</p>
                      <p className="text-xs text-amber-600">Upgrade your plan to add more leads</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="px-3 py-1.5 border border-amber-400 text-amber-600 rounded text-sm font-medium hover:border-amber-500">
                    Upgrade Now
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {['NEW', 'CONTACTED', 'QUALIFIED', 'SHOWING', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST'].map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{leadStats[status] || 0}</span>
                    <span className="text-gray-500">{status.replace('_', ' ').toLowerCase()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-900">All Leads ({leads.length})</h2>
                <button
                  onClick={() => canAdd('leads') ? setShowAddLeadModal(true) : setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    canAdd('leads') ? 'border-gray-900 text-gray-900' : 'border-amber-400 text-amber-600'
                  }`}
                >
                  {canAdd('leads') ? <UserPlus className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {canAdd('leads') ? 'Add Lead' : 'Upgrade to Add'}
                </button>
              </div>

              {leads.length === 0 ? (
                <EmptyState icon={Users} title="No leads yet" action={() => setShowAddLeadModal(true)} actionLabel="Add Lead" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="relative group">
                      <LeadCard
                        lead={lead}
                        onStatusChange={async (id, status) => {
                          await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
                          fetchData()
                        }}
                        onEdit={() => setShowEditLeadModal(lead)}
                        onScore={async (id) => {
                          const res = await fetch('/api/lead-scoring', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ leadId: id })
                          })
                          if (res.ok) {
                            const data = await res.json()
                            setLeads(prev => prev.map(l => l.id === id ? { ...l, score: data.score } : l))
                          }
                        }}
                      />
                      <button onClick={() => deleteLead(lead.id)} className="absolute top-2 right-2 p-1.5 bg-white rounded shadow opacity-0 group-hover:opacity-100 hover:text-red-500">
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard title="For Sale" value={stats.overview.forSaleCount} icon={Building2} />
                <StatsCard title="For Rent" value={stats.overview.forRentCount} icon={Building2} />
                <StatsCard title="Vacancy Rate" value={`${stats.overview.vacancyRate}%`} icon={Target} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={stats.charts.monthlyData} />
                <PropertyTypeChart data={stats.charts.propertyTypeDistribution} />
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Income" value={formatCurrency(stats.financials.totalIncome)} icon={TrendingUp} />
                <StatsCard title="Total Expenses" value={formatCurrency(stats.financials.totalExpenses)} icon={Wallet} />
                <StatsCard title="Net Income" value={formatCurrency(stats.financials.netIncome)} icon={DollarSign} />
                <StatsCard title="Commissions" value={formatCurrency(stats.financials.totalCommissions)} icon={Target} />
              </div>

              <RevenueChart data={stats.charts.monthlyData} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Transactions ({transactions.length})</h2>
                  <button onClick={() => setShowAddTransactionModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border border-gray-900 text-gray-900 hover:border-gray-700">
                    <Plus className="h-4 w-4" /> Add Transaction
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <EmptyState icon={DollarSign} title="No transactions yet" action={() => setShowAddTransactionModal(true)} actionLabel="Add Transaction" />
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Property</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-gray-900">{t.description}</td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded border ${t.type === 'INCOME' || t.type === 'COMMISSION' ? 'border-green-300 text-green-600' : 'border-red-300 text-red-600'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">{t.property?.title || '-'}</td>
                            <td className={`px-4 py-2 text-right font-medium ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
                              {t.type === 'EXPENSE' ? '-' : '+'}${t.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => setShowEditTransactionModal(t)} className="p-1 hover:bg-gray-100 rounded">
                                  <Pencil className="h-3 w-3 text-gray-500" />
                                </button>
                                <button onClick={() => deleteTransaction(t.id)} className="p-1 hover:text-red-500 rounded">
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {/* Limit Warning */}
              {subscriptionData && !canAdd('documents') && (
                <div className="p-4 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Document limit reached</p>
                      <p className="text-xs text-amber-600">Upgrade your plan to upload more documents</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="px-3 py-1.5 border border-amber-400 text-amber-600 rounded text-sm font-medium hover:border-amber-500">
                    Upgrade Now
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Documents ({documents.length})</h2>
                <button
                  onClick={() => canAdd('documents') ? setShowAddDocumentModal(true) : setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    canAdd('documents') ? 'border-gray-900 text-gray-900' : 'border-amber-400 text-amber-600'
                  }`}
                >
                  {canAdd('documents') ? <Upload className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
                  {canAdd('documents') ? 'Upload' : 'Upgrade to Upload'}
                </button>
              </div>

              {documents.length === 0 ? (
                <EmptyState icon={FileText} title="No documents yet" action={() => setShowAddDocumentModal(true)} actionLabel="Upload Document" />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Property</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Size</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {documents.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{d.name}</td>
                          <td className="px-4 py-2 text-gray-600">{d.category}</td>
                          <td className="px-4 py-2 text-gray-600">{d.property?.title || '-'}</td>
                          <td className="px-4 py-2 text-gray-600">{d.size}</td>
                          <td className="px-4 py-2 text-gray-600">{new Date(d.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-gray-200 rounded-lg">
                      <Store className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{marketplaceListings.length}</p>
                      <p className="text-xs text-gray-500">Available Leads</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-gray-200 rounded-lg">
                      <Tag className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{myListings.length}</p>
                      <p className="text-xs text-gray-500">My Listings</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 border border-gray-200 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">{myListings.filter(l => l.status === 'SOLD').length}</p>
                      <p className="text-xs text-gray-500">Leads Sold</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Leads */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Store className="h-4 w-4" /> Available Leads
                  </h2>
                  <button
                    onClick={() => setShowSellLeadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Sell a Lead
                  </button>
                </div>
                {marketplaceListings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No leads available in the marketplace</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to list a lead for sale!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {marketplaceListings.map((listing) => (
                      <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900">{listing.lead.name}</h3>
                              <span className="px-2 py-0.5 text-xs border border-gray-300 text-gray-600 rounded-full">
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
                            <p className="text-lg font-semibold text-gray-900">${listing.price}</p>
                            <button
                              onClick={async () => {
                                if (confirm(`Purchase this lead for $${listing.price}?`)) {
                                  const res = await fetch(`/api/marketplace/${listing.id}/purchase`, { method: 'POST' })
                                  if (res.ok) {
                                    const data = await res.json()
                                    if (data.checkoutUrl) window.location.href = data.checkoutUrl
                                  } else {
                                    alert('Failed to initiate purchase')
                                  }
                                }
                              }}
                              className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
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
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Tag className="h-4 w-4" /> My Listings
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900">{listing.lead.name}</h3>
                              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                listing.status === 'ACTIVE' ? 'border-gray-400 text-gray-700' :
                                listing.status === 'SOLD' ? 'border-gray-300 text-gray-500' :
                                'border-gray-200 text-gray-500'
                              }`}>
                                {listing.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Listed {new Date(listing.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">${listing.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
                  <p className="text-sm text-gray-500">Collaborate with your team members</p>
                </div>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Create Team
                </button>
              </div>

              {teams.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <UsersRound className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No teams yet</h3>
                  <p className="text-xs text-gray-500 mb-4">Create a team to start collaborating with others</p>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-900 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Create Your First Team
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <UsersRound className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
                            <p className="text-xs text-gray-500">{team.members.length} members</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowInviteMemberModal(team.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Invite
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {team.members.map((member) => (
                          <div key={member.id} className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {member.user.image ? (
                                <img
                                  src={member.user.image}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                  {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {member.user.name || member.user.email}
                                </p>
                                <p className="text-xs text-gray-500">{member.user.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              member.role === 'OWNER' ? 'border-gray-400 text-gray-700' :
                              member.role === 'ADMIN' ? 'border-gray-300 text-gray-600' :
                              'border-gray-200 text-gray-500'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        ))}
                      </div>
                      {team.invites.filter(i => i.status === 'PENDING').length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Pending Invites</p>
                          {team.invites.filter(i => i.status === 'PENDING').map((invite) => (
                            <div key={invite.id} className="flex items-center justify-between py-1">
                              <span className="text-sm text-gray-600">{invite.email}</span>
                              <span className="text-xs text-amber-600">Pending</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && subscriptionData && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    {profileSaving && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                      </span>
                    )}
                    {profileSaved && !profileSaving && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    )}
                  </div>
                </div>

                {profileError && (
                  <div className="mb-4 p-3 border border-red-300 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600">{profileError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 text-2xl font-medium bg-gray-50">
                          {profileForm.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        aria-label="Change profile photo"
                      >
                        {avatarUploading ? (
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {user.image ? 'Change' : 'Upload'}
                      </button>
                      {user.image && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={handleRemoveAvatar}
                            disabled={avatarUploading}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label htmlFor="profile-name" className="block text-xs text-gray-600 mb-1">
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-email" className="block text-xs text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="profile-phone" className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </label>
                        <input
                          id="profile-phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="profile-license" className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" /> License Number
                        </label>
                        <input
                          id="profile-license"
                          type="text"
                          value={profileForm.licenseNumber}
                          onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
                          placeholder="RE-123456"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>Role: <span className="text-gray-600 font-medium">{user.role}</span></span>
                      <span>•</span>
                      <span>Changes save automatically</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Plan & Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Current Plan
                  </h2>
                  <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                    subscriptionData.subscription.plan === 'FREE' ? 'border-gray-300 text-gray-600' :
                    subscriptionData.subscription.plan === 'STARTER' ? 'border-blue-300 text-blue-600' :
                    subscriptionData.subscription.plan === 'PROFESSIONAL' ? 'border-purple-300 text-purple-600' :
                    'border-amber-300 text-amber-600'
                  }`}>
                    {subscriptionData.subscription.plan === 'FREE' && <span>Free Plan</span>}
                    {subscriptionData.subscription.plan === 'STARTER' && <span>Starter - $29/mo</span>}
                    {subscriptionData.subscription.plan === 'PROFESSIONAL' && <span>Professional - $79/mo</span>}
                    {subscriptionData.subscription.plan === 'ENTERPRISE' && <span>Enterprise - $199/mo</span>}
                  </span>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <UsageBar
                    label="Properties"
                    current={subscriptionData.usage.properties.current}
                    limit={subscriptionData.usage.properties.limit}
                  />
                  <UsageBar
                    label="Leads"
                    current={subscriptionData.usage.leads.current}
                    limit={subscriptionData.usage.leads.limit}
                  />
                  <UsageBar
                    label="Documents"
                    current={subscriptionData.usage.documents.current}
                    limit={subscriptionData.usage.documents.limit}
                  />
                </div>

                {subscriptionData.subscription.plan === 'FREE' && (
                  <div className="p-3 border border-amber-300 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Upgrade to unlock more features</p>
                      <p className="text-xs text-amber-600 mt-0.5">Get more properties, leads, and advanced analytics</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Credits Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Credits
                  </h2>
                  <button
                    onClick={() => setShowBuyCreditsModal(true)}
                    className="text-xs text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Buy More
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium">AI Credits</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-500">For lead scoring</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium">Email Credits</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-500">For campaigns</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-600 font-medium">Lead Credits</span>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">0</p>
                    <p className="text-xs text-gray-500">For marketplace</p>
                  </div>
                </div>
                <div className="mt-4 p-3 border border-gray-200 rounded-lg">
                  <h3 className="text-xs font-medium text-gray-700 mb-2">Credit Packages</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/credits', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'AI', amount: 50 })
                        })
                        const data = await res.json()
                        if (data.checkoutUrl) window.location.href = data.checkoutUrl
                      }}
                      className="p-2 text-center border border-gray-200 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">50 AI</p>
                      <p className="text-xs text-gray-500">$9.99</p>
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/credits', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'EMAIL', amount: 500 })
                        })
                        const data = await res.json()
                        if (data.checkoutUrl) window.location.href = data.checkoutUrl
                      }}
                      className="p-2 text-center border border-gray-200 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">500 Email</p>
                      <p className="text-xs text-gray-500">$14.99</p>
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/credits', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'LEAD', amount: 10 })
                        })
                        const data = await res.json()
                        if (data.checkoutUrl) window.location.href = data.checkoutUrl
                      }}
                      className="p-2 text-center border border-gray-200 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">10 Lead</p>
                      <p className="text-xs text-gray-500">$19.99</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div>
                <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="h-4 w-4" /> Available Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subscriptionData.plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`bg-white border rounded-lg p-4 ${
                        plan.current ? 'border-[#37543E] ring-1 ring-[#37543E]' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{plan.name}</h3>
                        {plan.current && (
                          <span className="text-xs border border-gray-900 text-gray-900 px-2 py-0.5 rounded">Current</span>
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-sm text-gray-500">/mo</span>
                      </div>
                      <ul className="space-y-2 mb-4 text-sm">
                        <li className="flex items-center gap-2 text-gray-600">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          {plan.limits.properties === -1 ? 'Unlimited' : plan.limits.properties} properties
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          {plan.limits.leads === -1 ? 'Unlimited' : plan.limits.leads} leads
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          {plan.limits.documents === -1 ? 'Unlimited' : plan.limits.documents} documents
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          {plan.limits.teamMembers === -1 ? 'Unlimited' : plan.limits.teamMembers} team member{plan.limits.teamMembers !== 1 ? 's' : ''}
                        </li>
                      </ul>
                      {!plan.current && (
                        <button
                          onClick={() => upgradePlan(plan.name)}
                          disabled={upgrading}
                          className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                            plan.name === 'PROFESSIONAL'
                              ? 'border border-gray-900 text-gray-900 hover:border-gray-700'
                              : 'border border-gray-200 text-gray-500 hover:border-gray-300'
                          } disabled:opacity-50`}
                        >
                          {upgrading ? 'Processing...' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Security
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-900">Password</p>
                      <p className="text-xs text-gray-500">Last changed: Never</p>
                    </div>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-sm text-gray-900 border border-gray-300 px-3 py-1 rounded hover:border-gray-400 transition-colors"
                      >
                        Change
                      </button>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-gray-900">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security</p>
                    </div>
                    <span className="text-xs text-gray-400">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              {/* Quick Help */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="mailto:support@realestatepro.com" className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                  <Mail className="h-6 w-6 text-[#37543E] mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-500">Get help via email within 24 hours</p>
                </a>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <MessageCircle className="h-6 w-6 text-[#37543E] mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
                  <p className="text-sm text-gray-500">Chat with our team (Pro plans)</p>
                  {subscriptionData?.subscription.plan === 'FREE' && (
                    <button onClick={() => setActiveTab('settings')} className="mt-2 text-xs text-[#37543E] hover:underline">
                      Upgrade to access
                    </button>
                  )}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <BookOpen className="h-6 w-6 text-[#37543E] mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Documentation</h3>
                  <p className="text-sm text-gray-500">Browse guides and tutorials</p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {[
                    { q: 'How do I add a new property?', a: 'Go to Properties tab and click "Add Property" button to fill in the property details.' },
                    { q: 'How do I track my leads?', a: 'Navigate to Leads tab to view, add, and manage your client leads with status tracking.' },
                    { q: 'Can I export my data?', a: 'Yes, Professional and Enterprise plans include data export features.' },
                    { q: 'How do I upgrade my plan?', a: 'Go to Settings and select a plan that fits your needs. Payment is processed securely.' },
                    { q: 'What happens when I reach my limit?', a: 'You will be prompted to upgrade your plan to add more items.' },
                  ].map((faq, i) => (
                    <details key={i} className="group">
                      <summary className="flex items-center justify-between py-2 cursor-pointer text-sm text-gray-900 hover:text-gray-700">
                        {faq.q}
                        <ChevronRight className="h-4 w-4 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-sm text-gray-600 pl-4 pb-2">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-[#37543E] to-[#4a6b52] rounded-lg p-6 text-white">
                <h3 className="font-medium mb-2">Need more help?</h3>
                <p className="text-sm text-white/80 mb-4">Our support team is here to help you succeed.</p>
                <a href="mailto:support@realestatepro.com" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#37543E] rounded text-sm font-medium hover:bg-gray-100">
                  <Mail className="h-4 w-4" /> Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddPropertyModal && <PropertyModal onClose={() => setShowAddPropertyModal(false)} onSuccess={fetchData} userId={user.id} />}
      {showEditPropertyModal && <PropertyModal property={showEditPropertyModal} onClose={() => setShowEditPropertyModal(null)} onSuccess={fetchData} userId={user.id} />}
      {showAddLeadModal && <LeadModal onClose={() => setShowAddLeadModal(false)} onSuccess={fetchData} />}
      {showEditLeadModal && <LeadModal lead={showEditLeadModal} onClose={() => setShowEditLeadModal(null)} onSuccess={fetchData} />}
      {showAddTransactionModal && <TransactionModal properties={properties} onClose={() => setShowAddTransactionModal(false)} onSuccess={fetchData} />}
      {showEditTransactionModal && <TransactionModal transaction={showEditTransactionModal} properties={properties} onClose={() => setShowEditTransactionModal(null)} onSuccess={fetchData} />}
      {showAddDocumentModal && <DocumentModal properties={properties} onClose={() => setShowAddDocumentModal(false)} onSuccess={fetchData} />}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordForm({ current: '', new: '', confirm: '' })
                  setPasswordError(null)
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
              {passwordError && (
                <div className="p-3 border border-red-300 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-xs text-gray-600 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new-password" className="block text-xs text-gray-600 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 number</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs text-gray-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:border-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordForm({ current: '', new: '', confirm: '' })
                    setPasswordError(null)
                  }}
                  className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-2 text-sm font-medium text-gray-900 border border-gray-900 rounded-lg hover:border-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Lead Modal */}
      {showSellLeadModal && <SellLeadModal onClose={() => setShowSellLeadModal(false)} onSuccess={fetchData} leads={leads} />}

      {/* Create Team Modal */}
      {showCreateTeamModal && <CreateTeamModal onClose={() => setShowCreateTeamModal(false)} onSuccess={fetchData} />}

      {/* Invite Member Modal */}
      {showInviteMemberModal && <InviteMemberModal teamId={showInviteMemberModal} onClose={() => setShowInviteMemberModal(null)} onSuccess={fetchData} />}

      {/* Buy Credits Modal */}
      {showBuyCreditsModal && <BuyCreditsModal onClose={() => setShowBuyCreditsModal(false)} />}
    </div>
  )
}

/* Modal components are imported from @/components/dashboard/modals */

// Wrapper with Suspense for useSearchParams
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
