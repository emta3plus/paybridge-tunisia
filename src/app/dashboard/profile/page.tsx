'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CreditCard,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  LogOut,
  Shield,
  LayoutDashboard,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatTND, formatDate } from '@/lib/format'

interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  balance: number
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [authStatus, router])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setForm({ name: data.profile.name || '', phone: data.profile.phone || '' })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Profile Header Card */}
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'User'}</h2>
                  <p className="text-gray-500">{profile?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Member since {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="rounded-xl border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (cannot be changed)</Label>
                    <Input value={profile?.email || ''} disabled className="rounded-xl h-11 bg-gray-50" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditing(false)} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{profile?.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">{profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card className="rounded-xl border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Account Balance</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatTND(profile?.balance || 0)}</p>
                </div>
                <Link href="/dashboard/requests/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-xl border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-700">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
