import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const userGuard = await requireUser()
    if (!userGuard.authorized) {
      return userGuard.response
    }

    const { session } = userGuard
    const body = await request.json()
    const { planId } = body

    if (!planId || !["free", "starter", "pro"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan selected. Choose 'starter' or 'pro'." },
        { status: 400 }
      )
    }

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

    const supabase = await createClient()

    if (isPlaceholder) {
      // Sandbox mode: update user's profile in mock storage
      const { data, error } = await supabase
        .from("profiles")
        .eq("id", session.user!.id)
        .update({
          subscription_plan: planId,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Plan successfully upgraded to ${planId.toUpperCase()}`,
        subscription_plan: planId,
        subscription_status: "active",
        profile: data,
      })
    }

    // Production mode: update in Supabase
    const { data, error } = await supabase
      .from("profiles")
      .update({
        subscription_plan: planId,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user!.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Plan successfully updated to ${planId.toUpperCase()}`,
      subscription_plan: planId,
      subscription_status: "active",
      profile: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process subscription upgrade" },
      { status: 500 }
    )
  }
}
