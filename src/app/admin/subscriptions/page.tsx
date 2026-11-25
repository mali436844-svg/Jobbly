"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Check,
  RefreshCw
} from "lucide-react"

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-3">
            Subscriptions & Revenue Analytics <CreditCard className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), and subscription distribution.
          </p>
        </div>

        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Revenue Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Recurring Revenue (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading text-emerald-400">${stats?.mrr ?? 0}</div>
            <p className="text-xs text-slate-400 mt-2">Calculated from active Starter & Pro subscribers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Annual Run Rate (ARR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading text-amber-400">${stats?.arr ?? 0}</div>
            <p className="text-xs text-slate-400 mt-2">Projected 12-month revenue velocity</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Invoiced Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading text-purple-400">${stats?.totalRevenue ?? 0}</div>
            <p className="text-xs text-slate-400 mt-2">Processed contractor invoice volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tier Cards */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">Plan Distribution Matrix</h2>
          <p className="text-xs text-slate-400">Current subscriber count across available SaaS tiers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="border-slate-700 text-slate-300">Free Trial</Badge>
              <span className="text-xs font-bold text-slate-400">$0 / month</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-heading">{stats?.planDistribution?.free ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">Active trialing contractors</p>
            </div>
            <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> 30-Day trial access</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Basic jobs & clients</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> PDF invoices</li>
            </ul>
          </div>

          {/* Starter Tier */}
          <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/40 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-bl-lg uppercase">
              Popular
            </div>
            <div className="flex justify-between items-center">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Starter Plan</Badge>
              <span className="text-xs font-bold text-amber-400">$29 / month</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-heading">{stats?.planDistribution?.starter ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">Paying subscribers</p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Unlimited jobs & quotes</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Email invoice sending</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> Payment tracking</li>
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-950 p-6 rounded-xl border border-purple-500/40 space-y-4">
            <div className="flex justify-between items-center">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Pro Contractor</Badge>
              <span className="text-xs font-bold text-purple-400">$79 / month</span>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-heading">{stats?.planDistribution?.pro ?? 0}</p>
              <p className="text-xs text-slate-400 mt-1">Enterprise & high-volume teams</p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Multi-crew management</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Custom branding & domain</li>
              <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-purple-400" /> Priority 24/7 support</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
