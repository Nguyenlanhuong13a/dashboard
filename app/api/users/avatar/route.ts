import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/config'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Max file size: 500KB (base64 will be ~33% larger)
const MAX_FILE_SIZE = 500 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 500KB' },
        { status: 400 }
      )
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate image magic bytes
    const isValidImage = validateImageMagicBytes(buffer, file.type)
    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    // Convert to base64 data URL
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { image: dataUrl },
      select: { id: true, image: true }
    })

    return NextResponse.json({
      image: updatedUser.image,
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}

// DELETE - Remove avatar
export async function DELETE() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: authUser.id },
      data: { image: null }
    })

    return NextResponse.json({ message: 'Avatar removed successfully' })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
  }
}

// Validate image magic bytes to prevent file type spoofing
function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false

  const bytes = buffer.subarray(0, 12)

  switch (mimeType) {
    case 'image/jpeg':
      // JPEG: FF D8 FF
      return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF

    case 'image/png':
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      return bytes[0] === 0x89 &&
             bytes[1] === 0x50 &&
             bytes[2] === 0x4E &&
             bytes[3] === 0x47 &&
             bytes[4] === 0x0D &&
             bytes[5] === 0x0A &&
             bytes[6] === 0x1A &&
             bytes[7] === 0x0A

    case 'image/webp':
      // WebP: RIFF....WEBP
      return bytes[0] === 0x52 && // R
             bytes[1] === 0x49 && // I
             bytes[2] === 0x46 && // F
             bytes[3] === 0x46 && // F
             bytes[8] === 0x57 && // W
             bytes[9] === 0x45 && // E
             bytes[10] === 0x42 && // B
             bytes[11] === 0x50    // P

    default:
      return false
  }
}
