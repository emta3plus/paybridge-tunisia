import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const request = await db.paymentRequest.findFirst({
      where: { id, userId: user.id },
      include: { user: { select: { name: true, email: true, phone: true } } },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ request })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
