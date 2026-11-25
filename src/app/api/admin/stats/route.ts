import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const supabase = await createClient()
    const [
      { data: profiles },
      { data: jobs },
      { data: invoices },
      { data: clients }
    ] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("jobs").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("clients").select("*")
    ])

    const allProfiles = profiles || []
    const allJobs = jobs || []
    const allInvoices = invoices || []
    const allClients = clients || []

    const totalUsers = allProfiles.length
    const activeUsers = allProfiles.filter((p: any) => p.status === 'active' || !p.status).length
    const trialingUsers = allProfiles.filter((p: any) => p.subscription_status === 'trialing' || p.status === 'trialing').length
    
    const freePlanCount = allProfiles.filter((p: any) => p.subscription_plan === 'free' || !p.subscription_plan).length
    const starterPlanCount = allProfiles.filter((p: any) => p.subscription_plan === 'starter').length
    const proPlanCount = allProfiles.filter((p: any) => p.subscription_plan === 'pro').length

    const mrr = (starterPlanCount * 29) + (proPlanCount * 79)
    const arr = mrr * 12

    const totalPaidInvoices = allInvoices.filter((i: any) => i.status === 'paid')
    const totalRevenue = totalPaidInvoices.reduce((acc: number, inv: any) => acc + (Number(inv.total) || 0), 0)

    return NextResponse.json({
      totalUsers,
      activeUsers,
      trialingUsers,
      planDistribution: {
        free: freePlanCount,
        starter: starterPlanCount,
        pro: proPlanCount,
      },
      mrr,
      arr,
      totalJobs: allJobs.length,
      totalClients: allClients.length,
      totalInvoices: allInvoices.length,
      totalRevenue,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch admin stats" }, { status: 500 })
  }
}
