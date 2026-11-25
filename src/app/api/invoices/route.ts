import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { invoiceSchema } from "@/lib/validations"
import { generateInvoiceNumber, calculateLineItemTotal, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/utils"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*, client:clients(*), job:jobs(*)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(invoices)
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
    const validation = invoiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const items = validation.data.items

    // Recalculate totals
    const subtotal = calculateSubtotal(items)
    const taxAmount = calculateTax(subtotal, validation.data.tax_rate)
    const total = calculateTotal(subtotal, taxAmount)

    // Check plan limits (Free plan limit: 10 invoices)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_plan === "free") {
      const { count } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })

      if (count && count >= 10) {
        return NextResponse.json({
          error: "limit_reached",
          message: "You have reached the limit of 10 invoices on the free plan. Please upgrade to create unlimited invoices.",
        }, { status: 403 })
      }
    }

    // Count existing invoices to generate next invoice number
    const { count } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })

    const invoiceNumber = generateInvoiceNumber(count || 0)

    // Insert Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id: validation.data.client_id,
        job_id: validation.data.job_id || null,
        quote_id: validation.data.quote_id || null,
        invoice_number: invoiceNumber,
        status: "draft",
        due_date: validation.data.due_date || null,
        subtotal,
        tax_rate: validation.data.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: validation.data.notes || null,
        terms: validation.data.terms || null,
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Insert line items
    const invoiceItemsData = items.map((item, index) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: calculateLineItemTotal(item.quantity, item.unit_price),
      sort_order: index,
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItemsData)

    if (itemsError) {
      // Cleanup invoice if items insertion failed
      await supabase.from("invoices").delete().eq("id", invoice.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
