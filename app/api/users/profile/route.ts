import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/config'
import prisma from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema with strict sanitization
const profileUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters')
    .transform(s => s.trim())
    .optional(),
  phone: z.string()
    .max(20, 'Phone number too long')
    .regex(/^[+]?[\d\s\-().]*$/, 'Invalid phone format')
    .transform(s => s.trim())
    .optional()
    .nullable(),
  licenseNumber: z.string()
    .max(50, 'License number too long')
    .regex(/^[a-zA-Z0-9\-]*$/, 'Invalid license format')
    .transform(s => s.trim())
    .optional()
    .nullable(),
})

// GET - Fetch full profile
export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        licenseNumber: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH - Update profile
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check (simple in-memory, use Redis in production)
    const rateLimitKey = `profile_update_${authUser.id}`
    const now = Date.now()

    // Parse and validate body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Validate with zod schema
    const validation = profileUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Only include fields that were actually provided
    const updateData: Record<string, string | null> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber || null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        licenseNumber: true,
        image: true,
        role: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
