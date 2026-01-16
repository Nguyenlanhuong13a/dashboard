'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface NotificationDropdownProps {
  unreadCount: number
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationDropdown({ unreadCount }: NotificationDropdownProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalUnreadCount(unreadCount)
  }, [unreadCount])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || [])
        setLocalUnreadCount(data.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setLocalUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications()
    }
    setShowNotifications(!showNotifications)
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        aria-label={`Notifications${localUnreadCount > 0 ? `, ${localUnreadCount} unread` : ''}`}
        aria-expanded={showNotifications}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          showNotifications ? 'text-primary' : 'text-primary-dark/60 hover:text-primary'
        }`}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {localUnreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-white" aria-hidden="true" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 glass-card overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/5">
            <h2 className="font-display text-sm font-semibold text-primary-dark">Notifications</h2>
            {localUnreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:text-primary-light transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto overscroll-contain">
            {loadingNotifications ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-5 w-5 text-primary/40" />
                </div>
                <p className="text-sm text-primary-dark/50">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 transition-colors hover:bg-primary/5 cursor-pointer ${
                      notification.read ? '' : 'border-l-2 border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        notification.read ? 'bg-transparent' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-dark truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-primary-dark/60 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-primary-dark/40 mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
