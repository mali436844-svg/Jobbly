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

    // 1. Fetch quote with client details
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*, client:clients(*)")
      .eq("id", params.id)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Fetch quote line items
    const { data: items } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", params.id)

    // Fetch business profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Business profile not found" }, { status: 404 })
    }

    if (!quote.client?.email) {
      return NextResponse.json({ error: "Client has no email address configured" }, { status: 400 })
    }

    // 2. Generate PDF Buffer
    const pdfComponent = React.createElement(PDFTemplate, {
      type: "QUOTE",
      docNumber: quote.quote_number,
      date: formatDate(quote.created_at),
      dueDate: quote.valid_until ? formatDate(quote.valid_until) : undefined,
      businessProfile: profile,
      clientInfo: quote.client,
      items: items || [],
      subtotal: Number(quote.subtotal),
      taxRate: Number(quote.tax_rate),
      taxAmount: Number(quote.tax_amount),
      total: Number(quote.total),
      notes: quote.notes || undefined,
      terms: quote.terms || undefined,
    })

    const pdfBuffer = await renderToBuffer(pdfComponent as any)

    // 3. Initialize Resend and Send email
    const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key")
    const { data, error } = await resend.emails.send({
      from: `${profile.business_name} <billing@jobbly.com>`,
      to: [quote.client.email],
      subject: `New Quote Estimate ${quote.quote_number} from ${profile.business_name}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #f59e0b; font-size: 20px;">Hello ${quote.client.full_name},</h2>
          <p>${profile.business_name} has generated a new estimate quote for your review.</p>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr style="background: #f8fafc;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Quote Number:</td>
              <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${quote.quote_number}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Total Estimated Amount:</td>
              <td style="padding: 10px; text-align: right; color: #f59e0b; font-weight: bold; border-bottom: 1px solid #e2e8f0;">$${Number(quote.total).toFixed(2)}</td>
            </tr>
          </table>

          <p>Please find the detailed PDF proposal attached to this email. You can reply directly to this email to accept or request revisions.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p>Thank you for your business!</p>
            <p>${profile.business_name} • Phone: ${profile.business_phone || "N/A"}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Quote_${quote.quote_number}.pdf`,
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
