import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { PDFTemplate } from "@/components/pdf-template"
import { formatDate } from "@/lib/utils"

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

    // 1. Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .eq("id", params.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Fetch invoice line items
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", params.id)

    // Fetch business profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 })
    }

    if (!invoice.client?.email) {
      return NextResponse.json({ error: "Client has no email address configured" }, { status: 400 })
    }

    // 2. Generate PDF Buffer
    const pdfComponent = React.createElement(PDFTemplate, {
      type: "INVOICE",
      docNumber: invoice.invoice_number,
      date: formatDate(invoice.created_at),
      dueDate: invoice.due_date ? formatDate(invoice.due_date) : undefined,
      businessProfile: profile,
      clientInfo: invoice.client,
      items: items || [],
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.tax_rate),
      taxAmount: Number(invoice.tax_amount),
      total: Number(invoice.total),
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
    })

    const pdfBuffer = await renderToBuffer(pdfComponent as any)

    // 3. Initialize Resend and Send email
    const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key")
    const { data, error } = await resend.emails.send({
      from: `${profile.business_name} <billing@jobbly.com>`,
      to: [invoice.client.email],
      subject: `New Invoice Billing Statement ${invoice.invoice_number} from ${profile.business_name}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #f59e0b; font-size: 20px;">Hello ${invoice.client.full_name},</h2>
          <p>${profile.business_name} has sent you a new billing invoice statement.</p>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Invoice Number:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Due Date:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${invoice.due_date ? formatDate(invoice.due_date) : "Upon receipt"}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Total Amount Due:</td>
              <td style="padding: 10px; text-align: right; color: #f59e0b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">$${Number(invoice.total).toFixed(2)}</td>
            </tr>
          </table>

          <p>Please review the detailed statement in the attached PDF. You can send payments via standard check, bank transfer, or other methods mentioned in the terms.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p>Thank you for your business!</p>
            <p>${profile.business_name} • Phone: ${profile.business_phone || "N/A"}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
