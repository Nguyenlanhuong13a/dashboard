'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Wallet,
  Users,
  X,
  Store,
  UsersRound,
} from 'lucide-react'

type TabId = 'dashboard' | 'properties' | 'leads' | 'analytics' | 'financial' | 'documents' | 'marketplace' | 'teams' | 'settings' | 'help'

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onLogout: () => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileToggle: (open: boolean) => void
}

const navItems = [
  { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'properties' as TabId, label: 'Properties', icon: Building2 },
  { id: 'leads' as TabId, label: 'Leads', icon: Users },
  { id: 'marketplace' as TabId, label: 'Marketplace', icon: Store },
  { id: 'teams' as TabId, label: 'Teams', icon: UsersRound },
  { id: 'analytics' as TabId, label: 'Analytics', icon: BarChart3 },
  { id: 'financial' as TabId, label: 'Financial', icon: Wallet },
  { id: 'documents' as TabId, label: 'Documents', icon: FileText },
]

const bottomItems = [
  { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  { id: 'help' as TabId, label: 'Help', icon: HelpCircle },
]

export function Sidebar({ activeTab, onTabChange, onLogout, collapsed, onCollapse, mobileOpen, onMobileToggle }: SidebarProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) onMobileToggle(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen, onMobileToggle])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleTabChange = (tab: TabId) => {
    onTabChange(tab)
    onMobileToggle(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary-dark/20 backdrop-blur-sm lg:hidden"
          onClick={() => onMobileToggle(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-white/70 backdrop-blur-[20px] border-r border-white/30
          flex flex-col transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ width: collapsed ? 80 : 260 }}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-primary/5 ${collapsed ? 'justify-center px-4' : 'justify-between px-5'}`}>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-semibold text-primary-dark">RealEstate</span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMobileToggle(false)}
              aria-label="Close menu"
              className="lg:hidden p-2 rounded-xl text-primary-dark/50 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
            {!collapsed && (
              <button
                onClick={() => onCollapse(true)}
                aria-label="Collapse sidebar"
                className="hidden lg:block p-2 rounded-xl text-primary-dark/50 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => onCollapse(false)}
            aria-label="Expand sidebar"
            className="mx-auto mt-4 p-2 rounded-xl text-primary-dark/50 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
          </button>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-5 ${collapsed ? 'px-3' : 'px-4'}`} aria-label="Main navigation">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded-xl font-medium transition-all duration-200 cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                    ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                    ${isActive
                      ? 'bg-transparent border border-primary text-primary'
                      : 'text-primary-dark/60 hover:text-primary'
                    }
                  `}
                >
                  <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className={`py-4 border-t border-primary/5 ${collapsed ? 'px-3' : 'px-4'}`}>
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded-xl font-medium transition-all duration-200 cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                    ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                    ${isActive
                      ? 'bg-transparent border border-primary text-primary'
                      : 'text-primary-dark/60 hover:text-primary'
                    }
                  `}
                >
                  <item.icon className={`${collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </div>

          {/* Sign out */}
          <div className="mt-4 pt-4 border-t border-primary/5">
            <button
              onClick={onLogout}
              title={collapsed ? 'Sign out' : undefined}
              className={`
                w-full flex items-center rounded-xl font-medium text-primary-dark/50
                hover:text-red-500 hover:bg-red-50/50 transition-all duration-200 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
              `}
            >
              <LogOut className={`${collapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`} aria-hidden="true" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
