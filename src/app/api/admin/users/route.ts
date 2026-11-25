import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const supabase = await createClient()
    const { data: profiles, error } = await supabase.from("profiles").select("*")
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(profiles || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const body = await request.json()
    const supabase = await createClient()
    
    const newUser = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      full_name: body.full_name || "New User",
      business_name: body.business_name || "New Business",
      email: body.email,
      role: body.role || "user",
      status: body.status || "active",
      subscription_plan: body.subscription_plan || "free",
      subscription_status: body.subscription_status || "trialing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from("profiles").insert(newUser)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || newUser, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").eq("id", id).update(updates)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").eq("id", id).delete()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, deleted: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 })
  }
}
