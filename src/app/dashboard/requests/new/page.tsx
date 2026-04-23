'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  ArrowLeft,
  Loader2,
  Calculator,
  Globe,
  Server,
  Layout,
  Cloud,
  Dumbbell,
} from 'lucide-react'
import { formatTND, formatUSD } from '@/lib/format'
import { toast } from 'sonner'

const EXCHANGE_RATE = 3.25
const COMMISSION_RATE = 0.15

const POPULAR_SERVICES = [
  { name: 'OpenAI (ChatGPT)', icon: Globe },
  { name: 'Domain Registration', icon: Globe },
  { name: 'Web Hosting', icon: Server },
  { name: 'Figma', icon: Layout },
  { name: 'AWS / Cloud Services', icon: Cloud },
  { name: 'GitHub Pro', icon: Dumbbell },
  { name: 'Spotify Premium', icon: Globe },
  { name: 'Adobe Creative Cloud', icon: Cloud },
]

export default function NewRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    serviceName: '',
    amountUSD: '',
    description: '',
    serviceUrl: '',
  })

  // Pre-fill form from query params (reorder flow)
  useEffect(() => {
    const serviceParam = searchParams.get('service')
    const amountParam = searchParams.get('amount')
    if (serviceParam || amountParam) {
      setForm((prev) => ({
        ...prev,
        serviceName: serviceParam || prev.serviceName,
        amountUSD: amountParam ? String(Number(amountParam)) : prev.amountUSD,
      }))
    }
  }, [searchParams])

  const amountUSD = parseFloat(form.amountUSD) || 0
  const amountTND = amountUSD * EXCHANGE_RATE
  const commission = amountTND * COMMISSION_RATE
  const total = amountTND + commission

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.serviceName || !amountUSD || amountUSD <= 0) {
      toast.error('Please fill in service name and a valid amount')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: form.serviceName,
          amountUSD,
          description: form.description,
          serviceUrl: form.serviceUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create request')
        return
      }

      toast.success('Payment request created!')
      router.push(`/dashboard/requests/${data.request.id}`)
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">New Payment Request</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-5 gap-8"
        >
          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-xl border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      placeholder="e.g. OpenAI, Domain, Hosting"
                      value={form.serviceName}
                      onChange={(e) => updateForm('serviceName', e.target.value)}
                      required
                      className="rounded-xl h-11"
                    />
                  </div>

                  {/* Popular Services */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Popular services</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SERVICES.map((service) => (
                        <button
                          key={service.name}
                          type="button"
                          onClick={() => updateForm('serviceName', service.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <service.icon className="w-3.5 h-3.5" />
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amountUSD">Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <Input
                        id="amountUSD"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="20.00"
                        value={form.amountUSD}
                        onChange={(e) => updateForm('amountUSD', e.target.value)}
                        required
                        className="rounded-xl h-11 pl-7"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Any additional details about the payment..."
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      className="rounded-xl min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceUrl">Service URL (optional)</Label>
                    <Input
                      id="serviceUrl"
                      type="url"
                      placeholder="https://example.com/checkout"
                      value={form.serviceUrl}
                      onChange={(e) => updateForm('serviceUrl', e.target.value)}
                      className="rounded-xl h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Payment Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Live Calculator */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl border-emerald-200 shadow-lg shadow-emerald-50 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                  Price Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Service Amount</span>
                    <span className="font-medium text-gray-900">{formatUSD(amountUSD)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Exchange Rate</span>
                    <Badge variant="outline" className="text-xs">1 USD = {EXCHANGE_RATE} TND</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount in TND</span>
                    <span className="font-medium text-gray-900">{formatTND(amountTND)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Commission ({(COMMISSION_RATE * 100).toFixed(0)}%)</span>
                      <span className="font-medium text-amber-600">{formatTND(commission)}</span>
                    </div>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">You Pay</span>
                      <span className="text-2xl font-bold text-emerald-600">{formatTND(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    💡 Transfer the total amount to our bank account and upload proof. We&apos;ll handle the rest!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
