import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { businessProfileSchema } from "@/lib/validations"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = businessProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        business_name: validation.data.business_name,
        business_email: validation.data.business_email || null,
        business_phone: validation.data.business_phone || null,
        business_address: validation.data.business_address || null,
        business_city: validation.data.business_city || null,
        business_state: validation.data.business_state || null,
        business_zip: validation.data.business_zip || null,
        default_tax_rate: validation.data.default_tax_rate,
        default_payment_terms: validation.data.default_payment_terms || null,
        default_invoice_notes: validation.data.default_invoice_notes || null,
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedProfile)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
