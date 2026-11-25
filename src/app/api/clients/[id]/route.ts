import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { clientSchema } from "@/lib/validations"

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

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Fetch this client's jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("client_id", params.id)
      .order("created_at", { ascending: false })

    // Fetch this client's invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", params.id)
      .order("created_at", { ascending: false })

    return NextResponse.json({
      ...client,
      jobs: jobs || [],
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
    const validation = clientSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: updatedClient, error } = await supabase
      .from("clients")
      .update({
        full_name: validation.data.full_name,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
        company_name: validation.data.company_name || null,
        address: validation.data.address || null,
        city: validation.data.city || null,
        state: validation.data.state || null,
        zip: validation.data.zip || null,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedClient)
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
      .from("clients")
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
