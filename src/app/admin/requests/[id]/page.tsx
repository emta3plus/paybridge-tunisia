'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Shield,
  Upload,
  Loader2,
  Mail,
  Phone,
  User,
  Globe,
  Banknote,
  AlertCircle,
  DollarSign,
  Clock,
} from 'lucide-react'
import { formatTND, formatUSD, getStatusColor, getStatusLabel, formatDate } from '@/lib/format'
import { toast } from 'sonner'

interface RequestDetail {
  id: string
  serviceName: string
  amountUSD: number
  amountTND: number
  commission: number
  exchangeRate: number
  status: string
  description: string | null
  serviceUrl: string | null
  proofUser: string | null
  proofAdmin: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
}

export default function AdminRequestDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [uploadingProof, setUploadingProof] = useState(false)

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/requests?status=all`)
      if (res.ok) {
        const data = await res.json()
        const found = data.requests.find((r: RequestDetail) => r.id === id)
        if (found) {
          setRequest(found)
          setAdminNote(found.adminNote || '')
        } else {
          toast.error('Request not found')
          router.push('/admin')
        }
      }
    } catch {
      toast.error('Failed to load request')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (authStatus === 'authenticated' && session?.user && (session.user as { role: string }).role !== 'admin') {
      router.push('/')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session && id) {
      fetchRequest()
    }
  }, [session, id, fetchRequest])

  const handleAction = async (newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      })

      if (res.ok) {
        toast.success(`Request ${newStatus} successfully!`)
        fetchRequest()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProof(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch(`/api/admin/requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proofAdmin: base64 }),
        })

        if (res.ok) {
          toast.success('Admin proof uploaded!')
          fetchRequest()
        } else {
          toast.error('Failed to upload proof')
        }
        setUploadingProof(false)
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to read file')
      setUploadingProof(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!request) return null

  const totalTND = request.amountTND + request.commission

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-gray-900">Request Review</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Status & Service */}
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{request.serviceName}</h2>
                    <p className="text-sm text-gray-500">Created {formatDate(request.createdAt)}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(request.status)} text-sm px-4 py-1.5`} variant="outline">
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* User Info */}
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-500" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{request.user.email}</span>
                </div>
                {request.user.name && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{request.user.name}</span>
                  </div>
                )}
                {request.user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{request.user.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount (USD)</span>
                  <span className="font-medium">{formatUSD(request.amountUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Exchange Rate</span>
                  <span className="font-medium">{request.exchangeRate} TND/USD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount (TND)</span>
                  <span className="font-medium">{formatTND(request.amountTND)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission</span>
                  <span className="font-medium text-amber-600">{formatTND(request.commission)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-emerald-600">{formatTND(totalTND)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {request.description && (
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{request.description}</p>
              </CardContent>
            </Card>
          )}

          {/* User Payment Proof */}
          <Card className="rounded-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="w-5 h-5 text-gray-500" />
                User Payment Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.proofUser ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={request.proofUser}
                    alt="User payment proof"
                    className="w-full max-h-96 object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No payment proof uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {(request.status === 'paid' || request.status === 'approved') && (
            <Card className="rounded-xl border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Admin Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Admin Note</label>
                  <Textarea
                    placeholder="Add a note for the user..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="rounded-xl min-h-[80px] resize-none"
                  />
                </div>

                {/* Upload Admin Proof */}
                <div>
                  <label className="block mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Upload className="w-4 h-4" />
                      Upload Your Payment Proof
                    </span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white file:text-emerald-700 hover:file:bg-emerald-50 border border-emerald-200 rounded-lg p-2"
                    disabled={uploadingProof}
                  />
                  {uploadingProof && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {request.status === 'paid' && (
                    <Button
                      onClick={() => handleAction('approved')}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                    >
                      {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleAction('completed')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                    variant="destructive"
                    className="rounded-xl"
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already completed */}
          {request.status === 'completed' && (
            <Card className="rounded-xl border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-900">Request Completed</h3>
                <p className="text-green-700 mt-1">This request has been fully processed.</p>
              </CardContent>
            </Card>
          )}

          {/* Already rejected */}
          {request.status === 'rejected' && (
            <Card className="rounded-xl border-red-200 bg-red-50/50">
              <CardContent className="p-6 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-900">Request Rejected</h3>
                {request.adminNote && <p className="text-red-700 mt-1">{request.adminNote}</p>}
              </CardContent>
            </Card>
          )}

          {/* Pending - waiting for user */}
          {request.status === 'pending' && (
            <Card className="rounded-xl border-amber-200 bg-amber-50/50">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-amber-900">Awaiting Payment</h3>
                <p className="text-amber-700 mt-1">Waiting for the user to upload payment proof.</p>
              </CardContent>
            </Card>
          )}

          {/* Service URL */}
          {request.serviceUrl && (
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="w-4 h-4" />
                  <span className="truncate max-w-xs">{request.serviceUrl}</span>
                </div>
                <a href={request.serviceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">Visit</Button>
                </a>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  )
}
