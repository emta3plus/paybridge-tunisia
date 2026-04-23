import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await requireAuth()

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const unreadCount = await db.notification.count({
      where: { userId: user.id, read: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { notificationId, markAll } = body

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Missing notificationId or markAll' }, { status: 400 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Mark notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
