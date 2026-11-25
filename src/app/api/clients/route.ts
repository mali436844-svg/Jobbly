import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { clientSchema } from "@/lib/validations"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch clients
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("full_name", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Let's compute additional totals (total_jobs, total_billed) via sub-queries or separate fetches
    // To make this super reliable and fast:
    const clientsWithStats = await Promise.all(
      clients.map(async (client: any) => {
        // Count jobs
        const { count: jobCount } = await supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("client_id", client.id)

        // Sum billed invoices
        const { data: invoices } = await supabase
          .from("invoices")
          .select("total")
          .eq("client_id", client.id)
          .eq("status", "paid")

        const totalBilled = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.total), 0) || 0

        return {
          ...client,
          total_jobs: jobCount || 0,
          total_billed: totalBilled,
        }
      })
    )

    return NextResponse.json(clientsWithStats)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = clientSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    // Check plan limits (Free plan limit: 5 clients)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_plan === "free") {
      const { count } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })

      if (count && count >= 5) {
        return NextResponse.json({
          error: "limit_reached",
          message: "You have reached the limit of 5 clients on the free plan. Please upgrade to add more clients.",
        }, { status: 403 })
      }
    }

    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        user_id: user.id,
        full_name: validation.data.full_name,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
        company_name: validation.data.company_name || null,
        address: validation.data.address || null,
        city: validation.data.city || null,
        state: validation.data.state || null,
        zip: validation.data.zip || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newClient, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
