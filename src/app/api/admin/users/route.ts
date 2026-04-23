import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await requireAdmin()

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        balance: true,
        createdAt: true,
        _count: {
          select: { requests: true },
        },
      },
    })

    // Calculate total spent per user (completed requests)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const completedRequests = await db.paymentRequest.aggregate({
          where: {
            userId: user.id,
            status: 'completed',
          },
          _sum: {
            amountTND: true,
            commission: true,
          },
        })

        return {
          ...user,
          totalSpent: (completedRequests._sum.amountTND || 0) + (completedRequests._sum.commission || 0),
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
