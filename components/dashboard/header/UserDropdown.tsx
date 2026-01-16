'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, ChevronDown } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
}

interface UserDropdownProps {
  user: User | null
  onLogout?: () => void
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User menu"
        aria-expanded={showDropdown}
        aria-haspopup="menu"
        className={`flex items-center gap-2 p-1.5 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          showDropdown ? 'text-primary' : 'hover:text-primary'
        }`}
      >
        <div className="w-8 h-8 rounded-lg border border-primary/30 flex items-center justify-center text-primary text-xs font-semibold">
          {initials}
        </div>
        <ChevronDown className={`h-4 w-4 text-primary-dark/50 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {showDropdown && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 glass-card overflow-hidden animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-primary/10">
            <p className="font-medium text-sm text-primary-dark truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-primary-dark/60 truncate">{user?.email}</p>
          </div>
          <div className="p-2">
            <button
              role="menuitem"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-primary-dark/70 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer focus:outline-none focus-visible:bg-red-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
