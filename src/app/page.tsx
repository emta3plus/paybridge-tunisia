'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Banknote,
  Clock,
  Users,
  Star,
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PayBridge</span>
            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Tunisia
            </Badge>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-6 bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 px-4 py-1.5 text-sm">
                  🇹🇳 Built for Tunisian Users
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight"
              >
                Pay for International Services{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  from Tunisia
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              >
                We bridge the payment gap. You pay in TND, we pay internationally.
                No foreign bank account needed — just a few clicks.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto text-base px-8 py-6 rounded-xl">
                    Start Paying Internationally
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl border-gray-300">
                    How It Works
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Secure & Legal
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Fast Processing
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-emerald-500" />
                  Trusted
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Example */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-lg mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Card className="border-2 border-emerald-200 shadow-lg shadow-emerald-50 rounded-2xl overflow-hidden">
                  <div className="bg-emerald-600 text-white p-6 text-center">
                    <h3 className="text-xl font-bold">Pricing Example</h3>
                    <p className="text-emerald-100 mt-1">See how much you pay</p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Amount</span>
                      <span className="font-semibold text-gray-900">$20.00 USD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="font-medium text-gray-700">1 USD = 3.250 TND</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount in TND</span>
                      <span className="font-semibold text-gray-900">65.000 TND</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Commission (15%)</span>
                        <span className="font-semibold text-amber-600">9.750 TND</span>
                      </div>
                    </div>
                    <div className="border-t-2 border-emerald-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">You Pay</span>
                        <span className="text-2xl font-bold text-emerald-600">74.750 TND</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why Choose PayBridge?
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
                We make international payments accessible to everyone in Tunisia
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              <motion.div variants={fadeInUp}>
                <Card className="h-full rounded-2xl border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Payments</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Pay in TND via local bank transfer or cash deposit. No need for foreign bank accounts or credit cards.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="h-full rounded-2xl border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Legal</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Fully compliant with Tunisian regulations. Every transaction is tracked and transparent with payment proofs.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card className="h-full rounded-2xl border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Processing</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Most requests processed within 24 hours. Real-time status tracking with instant notifications.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
                How It Works
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
                Four simple steps to pay for any international service
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                {
                  step: '1',
                  title: 'Sign Up',
                  description: 'Create your free account in seconds with just your email and phone number.',
                  icon: Users,
                },
                {
                  step: '2',
                  title: 'Submit Request',
                  description: 'Enter the service you want to pay for, the amount in USD, and any additional details.',
                  icon: Globe,
                },
                {
                  step: '3',
                  title: 'Pay in TND',
                  description: 'Transfer the total amount in TND to our local bank account and upload proof.',
                  icon: Banknote,
                },
                {
                  step: '4',
                  title: 'Done!',
                  description: 'We pay the service provider internationally and send you confirmation.',
                  icon: CheckCircle,
                },
              ].map((item) => (
                <motion.div key={item.step} variants={fadeInUp} className="text-center">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-gradient-to-b from-white to-emerald-50/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
                Trusted & Secure
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
                Your money and data are always safe with PayBridge
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-4 gap-6"
            >
              {[
                { value: '500+', label: 'Happy Users', icon: Users },
                { value: '2,000+', label: 'Payments Processed', icon: CreditCard },
                { value: '99.9%', label: 'Uptime', icon: Shield },
                { value: '<24h', label: 'Average Processing', icon: Clock },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900">
                Frequently Asked Questions
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-gray-600 text-lg">
                Everything you need to know about PayBridge
              </motion.p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-4"
            >
              {[
                {
                  question: 'What services can I pay for?',
                  answer: 'You can pay for any international service that accepts USD payments: OpenAI/ChatGPT subscriptions, domain registrations, web hosting (AWS, DigitalOcean, Vercel), software licenses (Adobe, Figma, GitHub Pro), streaming services, and more.',
                },
                {
                  question: 'How does the pricing work?',
                  answer: 'We charge a transparent 15% commission on the TND equivalent of your payment. For example, a $20 service at 1 USD = 3.25 TND costs 65 TND + 9.75 TND commission = 74.75 TND total. No hidden fees.',
                },
                {
                  question: 'How long does it take to process my payment?',
                  answer: 'Most payments are processed within 24 hours. After you upload your payment proof, our team verifies it and processes the international payment. You receive real-time status updates throughout the process.',
                },
                {
                  question: 'Is PayBridge legal in Tunisia?',
                  answer: 'Yes! PayBridge operates as a digital payment service provider. We do not resell cards or share accounts. We provide a legitimate intermediary service where we pay on your behalf for international services.',
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'You can pay via local bank transfer (Tunisian banks), D17/e-Dinar wallet, or cash deposit at our partner banks. We provide detailed bank account information after you submit your payment request.',
                },
                {
                  question: 'What if my payment request is rejected?',
                  answer: 'If a request is rejected, you will receive a full refund of your TND payment along with an explanation from our team. You can then submit a new request with corrected details.',
                },
              ].map((faq, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="rounded-xl border-gray-200">
                    <CardContent className="p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white">
                Ready to Pay Internationally?
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-emerald-100 text-lg max-w-2xl mx-auto">
                Join hundreds of Tunisian users who trust PayBridge for their international payments.
                Sign up for free and get started today.
              </motion.p>
              <motion.div variants={fadeInUp} className="mt-10">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto text-base px-10 py-6 rounded-xl font-bold">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PayBridge</span>
            </div>
            <p className="text-sm text-center">
              © {new Date().getFullYear()} PayBridge Tunisia. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-sm">
              <Globe className="w-4 h-4" />
              <span>Made in Tunisia 🇹🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
