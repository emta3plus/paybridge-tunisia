'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  ArrowLeft,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { formatTND, getStatusColor, getStatusLabel, formatDate } from '@/lib/format'

interface Stats {
  totalRequests: number
  pendingRequests: number
  completedRequests: number
  completedToday: number
  totalUsers: number
  totalRevenue: number
  totalAmountUSD: number
  totalAmountTND: number
}

interface Request {
  id: string
  serviceName: string
  amountUSD: number
  amountTND: number
  commission: number
  status: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
}

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/requests'),
      ])
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      if (reqRes.ok) {
        const reqData = await reqRes.json()
        setRequests(reqData.requests)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (authStatus === 'authenticated' && session?.user && (session.user as { role: string }).role !== 'admin') {
      router.push('/')
    }
  }, [authStatus, session, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, fetchData])

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter)

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'approved', label: 'Approved' },
    { key: 'completed', label: 'Completed' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="rounded-lg">
                <Users className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Users</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Total Revenue</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{stats ? formatTND(stats.totalRevenue) : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.pendingRequests ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Completed Today</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.completedToday ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Total Users</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalUsers ?? '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests Table */}
          <Card className="rounded-xl border-gray-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">All Payment Requests</CardTitle>
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <Button
                    key={f.key}
                    variant={filter === f.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(f.key)}
                    className={filter === f.key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No requests found</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{req.serviceName}</p>
                          <p className="text-sm text-gray-500">
                            {req.user.name || req.user.email} · {formatDate(req.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                          {formatTND(req.amountTND + req.commission)}
                        </span>
                        <Badge className={getStatusColor(req.status)} variant="outline">
                          {getStatusLabel(req.status)}
                        </Badge>
                        <Link href={`/admin/requests/${req.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
