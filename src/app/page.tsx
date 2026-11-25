import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hammer, CheckCircle2, ArrowRight, Shield, Award, Users, Receipt, CalendarRange } from "lucide-react"
import { AdSenseBanner } from "@/components/adsense-banner"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-40">
        <Link className="flex items-center gap-2" href="#">
          <div className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-amber-500 text-white shadow-sm">
            <Hammer className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900">Jobbly</span>
        </Link>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/login" className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign In
          </Link>
          <Button asChild size="sm" className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4">
            <Link href="/register">Try Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-10 sm:py-16 lg:py-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] sm:text-xs font-semibold text-amber-700">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" /> Made for Plumbers, Electricians, Painters & HVAC
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
              Manage Jobs & Send Invoices <span className="text-amber-500">Fast.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-lg">
              Jobbly helps US-based professional contractors schedule jobs, build beautiful quotes, and get paid faster with professional invoicing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button asChild size="lg" className="font-semibold shadow-md h-11 sm:h-12 text-sm sm:text-base">
                <Link href="/register" className="flex items-center gap-2">
                  Start 30-Day Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-200 hover:bg-slate-50 font-semibold h-11 sm:h-12 text-sm sm:text-base">
                <Link href="/login">Access Account</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 text-[11px] sm:text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" /> No Credit Card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500 shrink-0" /> Cancel Anytime</span>
            </div>
          </div>
          
          <div className="relative rounded-2xl border border-slate-200/60 bg-slate-50 p-4 shadow-xl lg:p-6 overflow-hidden">
            <div className="rounded-lg bg-slate-900 text-white p-6 shadow-inner space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono">jobbly-dashboard</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-400">// Dynamic contractor dashboard</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-[10px]">REVENUE THIS MONTH</p>
                    <p className="text-amber-400 text-lg font-bold font-heading">$14,250.00</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-[10px]">ACTIVE JOBS</p>
                    <p className="text-emerald-400 text-lg font-bold font-heading">8 Jobs</p>
                  </div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2">
                  <p className="text-slate-400 text-[10px]">RECENT ACTIVITY</p>
                  <p className="text-white text-[11px] flex justify-between">
                    <span>⚡ Created Quote Q-2024-005 for John Smith</span>
                    <span className="text-slate-500">Just now</span>
                  </p>
                  <p className="text-white text-[11px] flex justify-between">
                    <span>💵 Paid Invoice INV-2024-002 ($1,450.00)</span>
                    <span className="text-slate-500">2h ago</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 border-y border-slate-100">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
                Everything you need to run your service business
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                No complex enterprise software. Just clean, fast, and simple tools that help you focus on the job.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Client Management</h3>
                <p className="text-sm text-slate-500">
                  Keep all your clients, contact info, job history, and billing records in one clean table.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <CalendarRange className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Job Tracking</h3>
                <p className="text-sm text-slate-500">
                  Filter jobs by status tabs (pending, active, completed, cancelled) and never lose track of a project.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Quotes & Invoicing</h3>
                <p className="text-sm text-slate-500">
                  Build elegant PDF quotes and invoices instantly. Calculate taxes automatically and send them via Resend.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">Secure supabased DB</h3>
                <p className="text-sm text-slate-500">
                  Your business data is safely secured with Supabase Row Level Security. Only you can view or edit your data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google AdSense Placement */}
        <section className="px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto py-2">
          <AdSenseBanner />
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-12 text-center text-[11px] sm:text-xs text-slate-500">
        <p>© 2024 Jobbly. All rights reserved. Professional tools for professional contractors.</p>
      </footer>
    </div>
  )
}
