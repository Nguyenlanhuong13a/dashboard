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
          className="fixed inset-0 z-40 bg-black/10 lg:hidden"
          onClick={() => onMobileToggle(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-white border-r border-gray-200
          flex flex-col transition-all duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ width: collapsed ? 72 : 240 }}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-gray-200 ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Building2 className="w-5 h-5 text-primary" aria-hidden="true" />
            {!collapsed && (
              <span className="font-display text-base font-semibold text-primary">RealEstate</span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMobileToggle(false)}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
            {!collapsed && (
              <button
                onClick={() => onCollapse(true)}
                aria-label="Collapse sidebar"
                className="hidden lg:block p-1.5 rounded text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
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
            className="mx-auto mt-3 p-1.5 rounded text-gray-400 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
          </button>
        )}

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`} aria-label="Main navigation">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded text-sm font-medium transition-colors duration-150 cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
                    ${isActive
                      ? 'bg-gray-50 text-primary border-l-2 border-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className={`py-3 border-t border-gray-200 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-0.5">
            {bottomItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center rounded text-sm font-medium transition-colors duration-150 cursor-pointer
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
                    ${isActive
                      ? 'bg-gray-50 text-primary border-l-2 border-primary'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }
                  `}
                >
                  <item.icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </div>

          {/* Sign out */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onLogout}
              title={collapsed ? 'Sign out' : undefined}
              className={`
                w-full flex items-center rounded text-sm font-medium text-gray-500
                hover:text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
              `}
            >
              <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
