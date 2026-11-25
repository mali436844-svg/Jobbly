import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    
    // Verify Lemon Squeezy signature
    const signature = req.headers.get("x-signature") || ""
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "mock_secret"
    const hmac = crypto.createHmac("sha256", secret)
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8")
    const sig = Buffer.from(signature, "utf8")

    if (sig.length !== digest.length || !crypto.timingSafeEqual(sig, digest)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName = payload.meta?.event_name
    const customerId = String(payload.data?.attributes?.customer_id || "")
    const subscriptionId = String(payload.data?.id || "")
    
    // Get custom user_id from passthrough custom_data
    const userId = payload.meta?.custom_data?.user_id || payload.meta?.passthrough?.user_id

    if (!userId) {
      return NextResponse.json({ success: true, message: "No user_id found in passthrough" })
    }

    // Initialize Supabase admin client using service role key to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let subscriptionStatus = "active"
    let subscriptionPlan = "starter" // default to starter

    const variantId = String(payload.data?.attributes?.variant_id || "")
    // Set plan based on Lemon Squeezy variant ID (mock matching)
    if (variantId === "pro_variant_id") {
      subscriptionPlan = "pro"
    } else {
      subscriptionPlan = "starter"
    }

    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      const status = payload.data?.attributes?.status
      if (status === "cancelled" || status === "unpaid") {
        subscriptionStatus = "cancelled"
      } else if (status === "expired") {
        subscriptionStatus = "expired"
      } else {
        subscriptionStatus = "active"
      }

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: subscriptionStatus,
          subscription_plan: subscriptionPlan,
          lemon_squeezy_customer_id: customerId,
          lemon_squeezy_subscription_id: subscriptionId,
        })
        .eq("id", userId)
    }

    if (eventName === "subscription_cancelled") {
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "cancelled",
        })
        .eq("id", userId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
