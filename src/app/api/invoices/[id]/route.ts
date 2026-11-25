import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { invoiceSchema } from "@/lib/validations"
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

    // Fetch invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, client:clients(*), job:jobs(*)")
      .eq("id", params.id)
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 404 })
    }

    // Fetch invoice items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", params.id)
      .order("sort_order", { ascending: true })

    // Fetch linked payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", params.id)
      .order("payment_date", { ascending: false })

    return NextResponse.json({
      ...invoice,
      items: items || [],
      payments: payments || [],
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
    const validation = invoiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const items = validation.data.items

    // Recalculate totals
    const subtotal = calculateSubtotal(items)
    const taxAmount = calculateTax(subtotal, validation.data.tax_rate)
    const total = calculateTotal(subtotal, taxAmount)

    // Update Invoice
    const { data: updatedInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        client_id: validation.data.client_id,
        job_id: validation.data.job_id || null,
        due_date: validation.data.due_date || null,
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

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Delete existing invoice items
    await supabase.from("invoice_items").delete().eq("invoice_id", params.id)

    // Insert new invoice items
    const invoiceItemsData = items.map((item, index) => ({
      invoice_id: params.id,
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
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json(updatedInvoice)
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
      .from("invoices")
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
