import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInvoiceNumber, calculateLineItemTotal } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quoteId = params.id

    // 1. Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // 2. Fetch quote items
    const { data: quoteItems } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quoteId)
      .order("sort_order", { ascending: true })

    // 3. Check Free plan limits (Max 10 invoices)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_plan === "free") {
      const { count } = await supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (count && count >= 10) {
        return NextResponse.json({
          error: "limit_reached",
          message: "You have reached the limit of 10 invoices on the Free plan. Please upgrade to create unlimited invoices.",
        }, { status: 403 })
      }
    }

    // 4. Generate next invoice number
    const { count: invoiceCount } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    const invoiceNumber = generateInvoiceNumber(invoiceCount || 0)

    // Due date defaults to 30 days from today (Net 30)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    const formattedDueDate = dueDate.toISOString().split("T")[0]

    // 5. Create Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id: quote.client_id,
        job_id: quote.job_id || null,
        quote_id: quote.id,
        invoice_number: invoiceNumber,
        status: "draft",
        due_date: formattedDueDate,
        subtotal: quote.subtotal,
        tax_rate: quote.tax_rate,
        tax_amount: quote.tax_amount,
        total: quote.total,
        notes: quote.notes || null,
        terms: quote.terms || "Payment terms are Net 30 days upon invoice receipt.",
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // 6. Copy line items
    if (quoteItems && quoteItems.length > 0) {
      const invoiceItemsData = quoteItems.map((item: any, index: number) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total || calculateLineItemTotal(item.quantity, item.unit_price),
        sort_order: index,
      }))

      await supabase.from("invoice_items").insert(invoiceItemsData)
    }

    // 7. Update Quote status to accepted
    await supabase
      .from("quotes")
      .update({ status: "accepted" })
      .eq("id", quote.id)

    return NextResponse.json({
      success: true,
      message: `Quote ${quote.quote_number} successfully converted to Invoice ${invoiceNumber}!`,
      invoice_id: invoice.id,
      invoice_number: invoiceNumber,
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
