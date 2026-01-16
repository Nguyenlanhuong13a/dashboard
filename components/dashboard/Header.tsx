'use client'

import { Search, Plus, Menu, Crown, Zap } from 'lucide-react'
import { NotificationDropdown, UserDropdown } from './header'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
}

interface SubscriptionInfo {
  plan: string
  nearLimit?: boolean
}

interface HeaderProps {
  title: string
  user: User | null
  onAddProperty?: () => void
  onLogout?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  unreadCount?: number
  subscription?: SubscriptionInfo
  onUpgrade?: () => void
  onMobileMenuToggle?: () => void
}

export function Header({
  title,
  user,
  onAddProperty,
  onLogout,
  searchQuery,
  onSearchChange,
  unreadCount = 0,
  subscription,
  onUpgrade,
  onMobileMenuToggle
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-[16px] border-b border-white/30">
      <div className="flex items-center justify-between px-5 sm:px-6 h-16">
        {/* Mobile menu button + Title */}
        <div className="flex items-center gap-4">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 rounded-xl text-primary-dark/60 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <h1 className="font-display text-lg font-semibold text-primary-dark">{title}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder="Search..."
                autoComplete="off"
                aria-label="Search properties"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-56 pl-11 pr-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-[8px] border border-white/30 text-sm text-primary-dark placeholder:text-primary-dark/40 transition-all focus:outline-none focus:bg-white/80 focus:border-primary/20 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          )}

          {/* Add button */}
          {onAddProperty && (
            <button
              onClick={onAddProperty}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-primary text-primary text-sm font-medium transition-all hover:border-primary-light active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add</span>
            </button>
          )}

          {/* Subscription Badge */}
          {subscription && (
            <button
              onClick={onUpgrade}
              aria-label={subscription.plan === 'FREE' ? 'Upgrade subscription' : `Current plan: ${subscription.plan}`}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer bg-transparent ${
                subscription.plan === 'FREE'
                  ? 'text-accent-gold border border-accent-gold/40 hover:border-accent-gold'
                  : subscription.plan === 'STARTER'
                  ? 'text-primary border border-primary/40 hover:border-primary'
                  : subscription.plan === 'PROFESSIONAL'
                  ? 'text-primary border border-primary/40 hover:border-primary'
                  : 'text-accent border border-accent/40 hover:border-accent'
              }`}
            >
              {subscription.plan === 'FREE' ? (
                <>
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Upgrade
                </>
              ) : (
                <>
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  {subscription.plan}
                </>
              )}
            </button>
          )}

          {/* Notifications */}
          <NotificationDropdown unreadCount={unreadCount} />

          {/* User dropdown */}
          <UserDropdown user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
