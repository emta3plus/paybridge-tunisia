import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const [totalRequests, pendingRequests, completedRequests, totalUsers] =
      await Promise.all([
        db.paymentRequest.count(),
        db.paymentRequest.count({ where: { status: 'pending' } }),
        db.paymentRequest.count({ where: { status: 'completed' } }),
        db.user.count(),
      ])

    const completedAmounts = await db.paymentRequest.aggregate({
      where: { status: 'completed' },
      _sum: { commission: true, amountTND: true, amountUSD: true },
    })

    const paidRequests = await db.paymentRequest.findMany({
      where: { status: { in: ['approved', 'completed'] } },
      select: { commission: true },
    })

    const totalRevenue = paidRequests.reduce((sum, r) => sum + r.commission, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = await db.paymentRequest.count({
      where: {
        status: 'completed',
        createdAt: { gte: today },
      },
    })

    return NextResponse.json({
      totalRequests,
      pendingRequests,
      completedRequests,
      completedToday,
      totalUsers,
      totalRevenue,
      totalAmountUSD: completedAmounts._sum.amountUSD || 0,
      totalAmountTND: completedAmounts._sum.amountTND || 0,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
