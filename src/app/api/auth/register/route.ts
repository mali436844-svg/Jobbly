import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getMockData, insertMockData } from "@/lib/supabase/mock-db"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, businessName, email, password } = body

    if (!email || !businessName || !password) {
      return NextResponse.json(
        { error: "Full name, business name, email, and password are required." },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

    if (isPlaceholder) {
      // Check if user already exists
      const existingProfiles = await getMockData("profiles", [{ type: "eq", column: "email", value: cleanEmail }], null, true, 1)
      if (existingProfiles && existingProfiles.length > 0) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please log in." },
          { status: 409 }
        )
      }

      const newUserId = "user-" + Math.random().toString(36).substring(2, 9)

      const newProfile = {
        id: newUserId,
        full_name: fullName || "Contractor",
        business_name: businessName,
        email: cleanEmail,
        password: password,
        role: "user", // Strictly user, never admin
        status: "active",
        subscription_plan: "free",
        subscription_status: "trialing",
        default_tax_rate: 0,
        default_payment_terms: "Net 30",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await insertMockData("profiles", newProfile)

      const response = NextResponse.json({
        success: true,
        user: {
          id: newProfile.id,
          full_name: newProfile.full_name,
          email: newProfile.email,
          role: "user",
        },
        redirect: "/dashboard",
      }, { status: 201 })

      // Set cookies for immediate session access
      response.cookies.set("demo_auth", "true", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_role", "user", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_email", encodeURIComponent(cleanEmail), { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_user_id", newUserId, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })

      return response
    }

    // Production Mode: Sign up via Supabase
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          business_name: businessName,
          role: "user",
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      redirect: "/dashboard",
    }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to complete user registration" },
      { status: 500 }
    )
  }
}
