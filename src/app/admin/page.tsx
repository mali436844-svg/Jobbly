"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CreditCard,
  Briefcase,
  TrendingUp,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  RefreshCw
} from "lucide-react"

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<any>(null)
  const [users, setUsers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ])
      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      setStats(statsData)
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error("Failed to load admin data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading flex items-center gap-3">
            Admin Overview Dashboard <Sparkles className="h-6 w-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant platform metrics, user registrations, and system controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Live Data
          </Button>
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
            <Link href="/admin/users">
              <UserPlus className="h-4 w-4 mr-2" /> Manage All Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Registered Users
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading text-white">{stats?.totalUsers ?? 0}</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1.5 font-medium">
              <TrendingUp className="h-3 w-3" /> Live users registered across app
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Est. Monthly Revenue (MRR)
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading text-white">${stats?.mrr ?? 0}</div>
            <p className="text-xs text-slate-400 mt-1.5">
              ARR: <span className="text-slate-200 font-semibold">${stats?.arr ?? 0}</span> / year
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active System Jobs
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading text-white">{stats?.totalJobs ?? 0}</div>
            <p className="text-xs text-slate-400 mt-1.5">
              Across <span className="text-slate-200 font-semibold">{stats?.totalClients ?? 0}</span> registered clients
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Platform Status
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-heading text-emerald-400 flex items-center gap-2">
              <Zap className="h-4 w-4 fill-emerald-400" /> Operational
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              All microservices & databases healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Free Trial Plan</span>
            <Badge variant="outline" className="border-slate-700 text-slate-300">Free</Badge>
          </div>
          <p className="text-2xl font-bold text-white font-heading">{stats?.planDistribution?.free ?? 0} Users</p>
          <p className="text-xs text-slate-500">30-Day active trial period</p>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-400 uppercase">Starter Plan ($29/mo)</span>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Starter</Badge>
          </div>
          <p className="text-2xl font-bold text-white font-heading">{stats?.planDistribution?.starter ?? 0} Users</p>
          <p className="text-xs text-slate-500">Solo contractors & small teams</p>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-400 uppercase">Pro Contractor Plan ($79/mo)</span>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Pro</Badge>
          </div>
          <p className="text-2xl font-bold text-white font-heading">{stats?.planDistribution?.pro ?? 0} Users</p>
          <p className="text-xs text-slate-500">Unlimited team & advanced invoicing</p>
        </Card>
      </div>

      {/* Live Registered Users Table */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
          <div>
            <CardTitle className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" /> Dynamic User Registrations
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Users who registered on the app automatically appear here in real time.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs">
            <Link href="/admin/users">
              View All ({users.length}) <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No registered users found yet. Try creating an account at <Link href="/register" className="text-amber-400 underline">/register</Link>!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">User Name / Owner</th>
                    <th className="px-6 py-3.5">Business Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Plan</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.slice(0, 5).map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {user.full_name || user.business_name || "Contractor User"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {user.business_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'admin'
                              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold"
                              : "border-slate-700 bg-slate-800 text-slate-300"
                          }
                        >
                          {user.role === 'admin' ? '👑 Admin' : '🔨 Contractor'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                          {user.subscription_plan || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            user.status === 'suspended'
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }
                        >
                          {user.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
