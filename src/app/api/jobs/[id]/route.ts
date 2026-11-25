import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { jobSchema } from "@/lib/validations"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: job, error } = await supabase
      .from("jobs")
      .select("*, client:clients(*)")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Fetch linked quotes
    const { data: quotes } = await supabase
      .from("quotes")
      .select("*")
      .eq("job_id", params.id)

    // Fetch linked invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("job_id", params.id)

    return NextResponse.json({
      ...job,
      quotes: quotes || [],
      invoices: invoices || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { data: updatedJob, error } = await supabase
      .from("jobs")
      .update({
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
      .eq("id", params.id)
      .select("*, client:clients(*)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedJob)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
