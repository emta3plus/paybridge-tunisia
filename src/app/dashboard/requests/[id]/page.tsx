'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  CreditCard,
  Upload,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Globe,
  Banknote,
  RefreshCw,
} from 'lucide-react'
import { formatTND, formatUSD, getStatusColor, getStatusLabel, formatDate } from '@/lib/format'
import { toast } from 'sonner'

// Status timeline step definitions
const TIMELINE_STEPS = [
  { key: 'created', label: 'Created', statuses: ['pending', 'paid', 'approved', 'completed'] },
  { key: 'paid', label: 'Paid', statuses: ['paid', 'approved', 'completed'] },
  { key: 'approved', label: 'Approved', statuses: ['approved', 'completed'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
] as const

// Rejected branches off after paid step
function getStepState(step: (typeof TIMELINE_STEPS)[number], currentStatus: string): 'completed' | 'current' | 'future' | 'rejected' {
  if (currentStatus === 'rejected') {
    if (step.key === 'created') return 'completed'
    if (step.key === 'paid') {
      // If rejected, check if it was rejected before or after paid
      // For simplicity: if status is rejected, paid could have been reached or not
      return 'completed'
    }
    if (step.key === 'approved') return 'rejected'
    if (step.key === 'completed') return 'future'
  }
  if (step.statuses.includes(currentStatus as 'pending' | 'paid' | 'approved' | 'completed')) {
    // Check if this is the current step
    const idx = step.statuses.indexOf(currentStatus as 'pending' | 'paid' | 'approved' | 'completed')
    if (idx === 0) return 'current'
    return 'completed'
  }
  return 'future'
}

function StatusTimeline({ status }: { status: string }) {
  return (
    <div className="flex items-center justify-between relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-0" />
      {TIMELINE_STEPS.map((step, idx) => {
        const state = getStepState(step, status)
        return (
          <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                state === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : state === 'current'
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : state === 'rejected'
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {state === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : state === 'current' ? (
                <Clock className="w-5 h-5" />
              ) : state === 'rejected' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <span className="text-xs font-medium">{idx + 1}</span>
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                state === 'future' ? 'text-gray-400' : 'text-gray-700'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

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
}

export default function RequestDetailPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session && id) {
      fetchRequest()
    }
  }, [session, id])

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`)
      if (res.ok) {
        const data = await res.json()
        setRequest(data.request)
      } else {
        toast.error('Request not found')
        router.push('/dashboard')
      }
    } catch {
      toast.error('Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch(`/api/requests/${id}/proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proof: base64 }),
        })

        if (res.ok) {
          toast.success('Payment proof uploaded successfully!')
          fetchRequest()
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to upload proof')
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      toast.error('Failed to read file')
      setUploading(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Request Details</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Status Card */}
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

          {/* Status Timeline */}
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Progress</h3>
              <StatusTimeline status={request.status} />
            </CardContent>
          </Card>

          {/* Reorder Button (completed only) */}
          {request.status === 'completed' && (
            <Link
              href={`/dashboard/requests/new?service=${encodeURIComponent(request.serviceName)}&amount=${request.amountUSD}`}
              className="block"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reorder Same Service
              </Button>
            </Link>
          )}

          {/* Payment Details */}
          <Card className="rounded-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount (USD)</p>
                  <p className="text-lg font-semibold text-gray-900">{formatUSD(request.amountUSD)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exchange Rate</p>
                  <p className="text-lg font-semibold text-gray-900">1 USD = {request.exchangeRate} TND</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount (TND)</p>
                  <p className="text-lg font-semibold text-gray-900">{formatTND(request.amountTND)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commission</p>
                  <p className="text-lg font-semibold text-amber-600">{formatTND(request.commission)}</p>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total to Pay</span>
                <span className="text-2xl font-bold text-emerald-600">{formatTND(totalTND)}</span>
              </div>
            </CardContent>
          </Card>

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

          {/* Payment Instructions (when pending) */}
          {(request.status === 'pending' || request.status === 'paid') && (
            <Card className="rounded-xl border-emerald-200 bg-emerald-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-emerald-100 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Transfer to:</p>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p><span className="font-medium">Bank:</span> Banque Nationale de Tunisie</p>
                    <p><span className="font-medium">Account:</span> 12 345 678 901 2345 6789</p>
                    <p><span className="font-medium">Name:</span> PayBridge Tunisia</p>
                    <p><span className="font-medium">RIB:</span> 00 123 4567890123456789 12</p>
                    <p className="pt-2 border-t"><span className="font-medium">Amount:</span> <span className="text-emerald-700 font-bold">{formatTND(totalTND)}</span></p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ⚠️ Include your email in the transfer description so we can verify your payment.
                </p>

                {request.status === 'pending' && (
                  <div>
                    <label className="block mb-2">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        Upload Payment Proof
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                )}

                {request.status === 'paid' && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-700">Payment proof received. Waiting for admin review.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Proof (when completed) */}
          {request.proofAdmin && request.status === 'completed' && (
            <Card className="rounded-xl border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Payment Completed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your international payment has been processed successfully. Below is the proof of payment:
                </p>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={request.proofAdmin}
                    alt="Admin payment proof"
                    className="w-full max-h-96 object-contain bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Note */}
          {request.adminNote && (
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  Admin Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{request.adminNote}</p>
              </CardContent>
            </Card>
          )}

          {/* Rejected notice */}
          {request.status === 'rejected' && (
            <Card className="rounded-xl border-red-200 bg-red-50/50">
              <CardContent className="p-6 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-900">Request Rejected</h3>
                {request.adminNote && (
                  <p className="text-red-700 mt-2">{request.adminNote}</p>
                )}
                <p className="text-sm text-red-600 mt-4">
                  If you think this is a mistake, please create a new request or contact support.
                </p>
                <Link href="/dashboard/requests/new" className="mt-4 inline-block">
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    Create New Request
                  </Button>
                </Link>
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
