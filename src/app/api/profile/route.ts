import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, phone: true, role: true, balance: true, createdAt: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { name, phone } = body

    const profile = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      select: { id: true, email: true, name: true, phone: true, role: true, balance: true, createdAt: true },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
