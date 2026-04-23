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
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Shield,
  FileText,
  DollarSign,
  UserCircle,
} from 'lucide-react'
import { formatTND, formatDate } from '@/lib/format'

interface UserRow {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  balance: number
  createdAt: string
  _count: {
    requests: number
  }
  totalSpent: number
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
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
      fetchUsers()
    }
  }, [session, fetchUsers])

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-lg font-semibold text-gray-900">User Management</span>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {users.length} Users
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-gray-500" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-3 font-medium text-gray-500">User</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-500">Contact</th>
                          <th className="text-center py-3 px-3 font-medium text-gray-500">Role</th>
                          <th className="text-center py-3 px-3 font-medium text-gray-500">Requests</th>
                          <th className="text-right py-3 px-3 font-medium text-gray-500">Total Spent</th>
                          <th className="text-left py-3 px-3 font-medium text-gray-500">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-xs">
                                  {(user.name || user.email)[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.name || '—'}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{user.phone || '—'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant="outline"
                                className={
                                  user.role === 'admin'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-medium">{user._count.requests}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-medium text-gray-900">{formatTND(user.totalSpent)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-gray-500 text-xs">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold">
                              {(user.name || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || '—'}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              user.role === 'admin'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }
                          >
                            {user.role}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{user.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{user._count.requests} requests</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium text-emerald-700">{formatTND(user.totalSpent)}</span>
                          </div>
                          <div className="text-gray-400 text-xs flex items-center">
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
