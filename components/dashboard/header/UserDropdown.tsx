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
        className={`flex items-center gap-1.5 p-1 rounded transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          showDropdown ? 'bg-gray-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-primary text-xs font-medium">
          {initials}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {showDropdown && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded overflow-hidden animate-fade-in z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-sm text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <button
              role="menuitem"
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer focus:outline-none focus-visible:bg-red-50"
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
