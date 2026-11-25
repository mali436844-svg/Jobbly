"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { StatsCard } from "@/components/stats-card"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import {
  DollarSign,
  Briefcase,
  Receipt,
  FileText,
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard")
        if (!res.ok) throw new Error("Failed to load dashboard data")
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        toast.error(err.message || "An error occurred while loading dashboard")
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const stats = data?.stats || {
    revenueThisMonth: 0,
    revenueTrend: 0,
    revenueTrendPositive: true,
    activeJobs: 0,
    pendingInvoices: 0,
    pendingQuotes: 0,
  }

  const chartData = data?.chartData || []
  const activities = data?.activities || []

  return (
    <div className="space-y-5 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here is a summary of your contracting business today."
        action={{
          label: "New Job",
          onClick: () => router.push("/dashboard/jobs"),
          icon: Plus,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenueThisMonth)}
          icon={DollarSign}
          trend={{
            value: Math.abs(stats.revenueTrend),
            isPositive: stats.revenueTrendPositive,
          }}
        />
        <StatsCard
          title="Active Jobs"
          value={String(stats.activeJobs)}
          icon={Briefcase}
        />
        <StatsCard
          title="Pending Invoices"
          value={String(stats.pendingInvoices)}
          icon={Receipt}
        />
        <StatsCard
          title="Quotes Awaiting Approval"
          value={String(stats.pendingQuotes)}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" /> Revenue Overview
            </CardTitle>
            <CardDescription>
              Line chart of paid revenue over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-56 sm:h-80">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No revenue records available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" /> Recent Activity
            </CardTitle>
            <CardDescription>
              Last 5 actions across jobs, invoices, and quotes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm">
                No recent activity to display. Start creating jobs or invoices!
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((act: any) => (
                  <div key={act.id} className="flex gap-4 items-start">
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      act.type === 'job' ? 'bg-blue-50 text-blue-600' :
                      act.type === 'invoice' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {act.type === 'job' ? <Briefcase className="h-3.5 w-3.5" /> :
                       act.type === 'invoice' ? <Receipt className="h-3.5 w-3.5" /> :
                       <FileText className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{act.title}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{act.detail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusBadge status={act.status} className="text-[9px] px-1.5 py-0" />
                        <span className="text-[9px] text-slate-400">{formatDate(act.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
