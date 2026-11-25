import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { quoteSchema } from "@/lib/validations"
import { generateQuoteNumber, calculateLineItemTotal, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/utils"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: quotes, error } = await supabase
      .from("quotes")
      .select("*, client:clients(*), job:jobs(*)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(quotes)
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
    const validation = quoteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const items = validation.data.items

    // Calculate subtotal, tax, and total
    const subtotal = calculateSubtotal(items)
    const taxAmount = calculateTax(subtotal, validation.data.tax_rate)
    const total = calculateTotal(subtotal, taxAmount)

    // Count existing quotes to generate next quote number
    const { count } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })

    const quoteNumber = generateQuoteNumber(count || 0)

    // Insert Quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: user.id,
        client_id: validation.data.client_id,
        job_id: validation.data.job_id || null,
        quote_number: quoteNumber,
        status: "draft",
        valid_until: validation.data.valid_until || null,
        subtotal,
        tax_rate: validation.data.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: validation.data.notes || null,
        terms: validation.data.terms || null,
      })
      .select()
      .single()

    if (quoteError) {
      return NextResponse.json({ error: quoteError.message }, { status: 500 })
    }

    // Insert line items
    const quoteItemsData = items.map((item, index) => ({
      quote_id: quote.id,
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
      // Cleanup quote if items insertion failed
      await supabase.from("quotes").delete().eq("id", quote.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
