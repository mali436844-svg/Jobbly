import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { quoteSchema } from "@/lib/validations"
import { calculateLineItemTotal, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/utils"

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

    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*, client:clients(*), job:jobs(*)")
      .eq("id", params.id)
      .single()

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 404 })
    }

    // Fetch quote items
    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", params.id)
      .order("sort_order", { ascending: true })

    return NextResponse.json({
      ...quote,
      items: items || [],
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
    const validation = quoteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const items = validation.data.items

    // Recalculate totals
    const subtotal = calculateSubtotal(items)
    const taxAmount = calculateTax(subtotal, validation.data.tax_rate)
    const total = calculateTotal(subtotal, taxAmount)

    // Update Quote
    const { data: updatedQuote, error: quoteError } = await supabase
      .from("quotes")
      .update({
        client_id: validation.data.client_id,
        job_id: validation.data.job_id || null,
        valid_until: validation.data.valid_until || null,
        subtotal,
        tax_rate: validation.data.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: validation.data.notes || null,
        terms: validation.data.terms || null,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 500 })
    }

    // Delete existing quote items
    await supabase.from("quote_items").delete().eq("quote_id", params.id)

    // Insert new quote items
    const quoteItemsData = items.map((item, index) => ({
      quote_id: params.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: calculateLineItemTotal(item.quantity, item.unit_price),
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(quoteItemsData)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(updatedQuote)
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
      .from("quotes")
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
