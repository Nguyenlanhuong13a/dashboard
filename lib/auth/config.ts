import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const COOKIE_NAME = 'auth_token'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function createToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

// In-memory cache for user verification (5 min TTL)
const userCache = new Map<string, { user: AuthUser; timestamp: number }>()
const USER_CACHE_TTL = 300000 // 5 minutes

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthCookie()
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  // JWT already contains user info and is cryptographically signed
  // Return decoded user directly for fast auth (no DB round-trip)
  return {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
    image: decoded.image || null,
    role: decoded.role
  }
}

// Use this only when fresh DB data is needed (profile updates, etc.)
export async function getCurrentUserFromDB(): Promise<AuthUser | null> {
  const token = await getAuthCookie()
  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  // Check cache first
  const cached = userCache.get(decoded.id)
  if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
    return cached.user
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, name: true, image: true, role: true }
  })

  if (!user) return null

  // Cache the result
  userCache.set(decoded.id, { user, timestamp: Date.now() })
  return user
}
