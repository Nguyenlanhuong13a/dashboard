import { NextResponse } from 'next/server'
import { getCurrentUserFromDB } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUserFromDB()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}
