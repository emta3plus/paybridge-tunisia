'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  DollarSign,
  LogOut,
  TrendingUp,
  LayoutDashboard,
  FileText,
  Search,
  UserCircle,
} from 'lucide-react'
import { formatTND, getStatusColor, getStatusLabel, formatDate } from '@/lib/format'
import { NotificationBell } from '@/components/notification-bell'

interface Request {
  id: string
  serviceName: string
  amountUSD: number
  amountTND: number
  commission: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchRequests()
    }
  }, [session, fetchRequests])

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests
    const query = searchQuery.toLowerCase()
    return requests.filter((r) => r.serviceName.toLowerCase().includes(query))
  }, [requests, searchQuery])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const pendingCount = requests.filter((r) => r.status === 'pending' || r.status === 'paid').length
  const completedCount = requests.filter((r) => r.status === 'completed').length
  const totalSpent = requests
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.amountTND + r.commission, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">PayBridge</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2 text-gray-500">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/dashboard/profile" className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors" title="My Profile">
                <span className="text-sm font-semibold text-emerald-700">
                  {(session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
            </Link>
            <span className="text-sm text-gray-600 hidden sm:block">{session?.user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-500"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
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
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {session?.user?.name || 'User'}
              </h1>
              <p className="text-gray-500 mt-1">Manage your payment requests</p>
            </div>
            <Link href="/dashboard/requests/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6">
                <Plus className="w-4 h-4 mr-2" />
                New Payment Request
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{pendingCount}</p>
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
                    <p className="text-xs text-gray-500 sm:text-sm">Completed</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Total Spent</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{formatTND(totalSpent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 sm:text-sm">Total Requests</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <Card className="rounded-xl border-gray-200">
            <CardHeader className="flex flex-col gap-3 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Recent Requests
              </CardTitle>
              {requests.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by service name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl h-9"
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'No matching requests found' : 'No payment requests yet'}
                  </p>
                  {!searchQuery && (
                    <Link href="/dashboard/requests/new">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Request
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredRequests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/dashboard/requests/${req.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{req.serviceName}</p>
                          <p className="text-sm text-gray-500">${req.amountUSD.toFixed(2)} · {formatDate(req.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                          {formatTND(req.amountTND + req.commission)}
                        </span>
                        <Badge className={getStatusColor(req.status)} variant="outline">
                          {getStatusLabel(req.status)}
                        </Badge>
                      </div>
                    </Link>
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
