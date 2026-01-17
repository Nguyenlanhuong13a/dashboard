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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Mobile menu button + Title */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              aria-label="Open menu"
              className="lg:hidden p-1.5 -ml-1.5 rounded text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <h1 className="font-display text-base font-semibold text-primary">{title}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                name="search"
                placeholder="Search..."
                autoComplete="off"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 pl-9 pr-3 py-2 rounded border border-gray-200 text-sm text-primary placeholder:text-gray-400 transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Add button */}
          {onAddProperty && (
            <button
              onClick={onAddProperty}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors cursor-pointer"
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
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium uppercase tracking-wide transition-colors cursor-pointer ${
                subscription.plan === 'FREE'
                  ? 'border-amber-300 text-amber-600 hover:border-amber-400'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
