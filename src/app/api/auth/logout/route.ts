import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  if (!isPlaceholder) {
    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.warn("Supabase signOut error:", e)
    }
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" })

  response.cookies.delete("demo_auth")
  response.cookies.delete("demo_role")
  response.cookies.delete("demo_email")
  response.cookies.delete("demo_user_id")

  return response
}
