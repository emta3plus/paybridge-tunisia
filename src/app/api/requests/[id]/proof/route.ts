import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await req.json()
    const { proof } = body

    if (!proof) {
      return NextResponse.json(
        { error: 'Payment proof is required' },
        { status: 400 }
      )
    }

    const request = await db.paymentRequest.findFirst({
      where: { id, userId: user.id },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (request.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can receive payment proof' },
        { status: 400 }
      )
    }

    const updated = await db.paymentRequest.update({
      where: { id },
      data: { proofUser: proof, status: 'paid' },
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Upload proof error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
