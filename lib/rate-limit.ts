/**
 * @fileoverview Rate Limiting Utility
 *
 * Provides protection against brute force attacks and API abuse.
 * Uses an in-memory store with automatic cleanup of expired entries.
 *
 * Preset Configurations:
 * - auth: 5 requests per 15 minutes (login, password reset)
 * - api: 60 requests per minute (general API calls)
 * - read: 120 requests per minute (read-only operations)
 * - sensitive: 10 requests per hour (payment, account deletion)
 *
 * Note: For production at scale, replace with Redis-based implementation
 * to support distributed rate limiting across multiple server instances.
 *
 * @example
 * const result = rateLimit(`login_${clientIP}`, rateLimitConfigs.auth)
 * if (!result.success) {
 *   return res.status(429).json({ error: 'Too many requests' })
 * }
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  let entry = rateLimitStore.get(key)

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.max - 1,
      resetTime: entry.resetTime
    }
  }

  // Increment count
  entry.count++

  // Check if over limit
  if (entry.count > config.max) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  return {
    success: true,
    remaining: config.max - entry.count,
    resetTime: entry.resetTime
  }
}

// Preset configurations
export const rateLimitConfigs = {
  // Strict - for auth endpoints
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 minutes

  // Normal - for API endpoints
  api: { windowMs: 60 * 1000, max: 60 }, // 60 requests per minute

  // Relaxed - for read endpoints
  read: { windowMs: 60 * 1000, max: 120 }, // 120 requests per minute

  // Very strict - for sensitive operations
  sensitive: { windowMs: 60 * 60 * 1000, max: 10 } // 10 requests per hour
}

// Helper to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}
