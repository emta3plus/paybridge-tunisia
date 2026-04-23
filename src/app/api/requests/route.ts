import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

const EXCHANGE_RATE = 3.25
const COMMISSION_RATE = 0.15

export async function GET() {
  try {
    const user = await requireAuth()

    const requests = await db.paymentRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { serviceName, amountUSD, description, serviceUrl } = body

    if (!serviceName || !amountUSD || amountUSD <= 0) {
      return NextResponse.json(
        { error: 'Service name and valid amount are required' },
        { status: 400 }
      )
    }

    const amountTND = amountUSD * EXCHANGE_RATE
    const commission = amountTND * COMMISSION_RATE

    const request = await db.paymentRequest.create({
      data: {
        userId: user.id,
        serviceName,
        amountUSD,
        amountTND,
        commission,
        exchangeRate: EXCHANGE_RATE,
        description: description || null,
        serviceUrl: serviceUrl || null,
      },
    })

    await db.notification.create({
      data: {
        userId: user.id,
        title: 'New Payment Request',
        message: `Your payment request for ${serviceName} ($${amountUSD.toFixed(2)}) has been created. Total: ${amountTND.toFixed(2)} TND + ${commission.toFixed(2)} TND commission.`,
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
