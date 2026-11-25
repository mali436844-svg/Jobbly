import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jobSchema } from "@/lib/validations"

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("jobs")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: jobs, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(jobs)
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
    const validation = jobSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: newJob, error } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        client_id: validation.data.client_id,
        title: validation.data.title,
        job_type: validation.data.job_type,
        status: validation.data.status,
        start_date: validation.data.start_date || null,
        end_date: validation.data.end_date || null,
        location: validation.data.location || null,
        description: validation.data.description || null,
        internal_notes: validation.data.internal_notes || null,
      })
      .select("*, client:clients(*)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(newJob, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
