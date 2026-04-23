import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const { status, adminNote, proofAdmin } = body

    const validStatuses = ['approved', 'completed', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, completed, or rejected' },
        { status: 400 }
      )
    }

    const request = await db.paymentRequest.findUnique({ where: { id } })
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (adminNote !== undefined) updateData.adminNote = adminNote
    if (proofAdmin !== undefined) updateData.proofAdmin = proofAdmin

    const updated = await db.paymentRequest.update({
      where: { id },
      data: updateData,
    })

    if (status) {
      const statusMessages: Record<string, string> = {
        approved: 'Your payment request has been approved. We are processing the international payment.',
        completed: 'Your payment request has been completed successfully!',
        rejected: 'Your payment request has been rejected.',
      }

      await db.notification.create({
        data: {
          userId: request.userId,
          title: `Request ${status}`,
          message: statusMessages[status] || `Your request status has been updated to ${status}.`,
        },
      })
    }

    return NextResponse.json({ request: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin update request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
