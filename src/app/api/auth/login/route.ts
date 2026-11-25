import { NextResponse } from "next/server"
import { getMockData } from "@/lib/supabase/mock-db"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usernameOrEmail, email, password, portal = "user" } = body
    const credential = (usernameOrEmail || email || "").toString().trim()
    const rawPassword = (password || "").toString()

    if (!credential || !rawPassword) {
      return NextResponse.json(
        { error: "Username/Email and password are required." },
        { status: 400 }
      )
    }

    const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

    if (isPlaceholder) {
      const normalizedCredential = credential.toLowerCase()

      // 1. ADMIN PORTAL LOGIN
      if (portal === "admin") {
        const isAdminUser =
          normalizedCredential === "iamdev$00" ||
          normalizedCredential === "iamdev$00@jobbly.com" ||
          normalizedCredential === "admin@jobbly.com" ||
          normalizedCredential === "admin"

        if (!isAdminUser || rawPassword !== "open445") {
          return NextResponse.json(
            { error: "Invalid administrator credentials. Access Denied." },
            { status: 401 }
          )
        }

        const adminProfile = {
          id: "admin-user-id",
          full_name: "Super Admin (iamdev$00)",
          username: "iamdev$00",
          email: "iamdev$00@jobbly.com",
          role: "admin",
          status: "active",
        }

        const response = NextResponse.json({
          success: true,
          user: adminProfile,
          role: "admin",
          redirect: "/admin",
        })

        // Set secure cookies for session
        response.cookies.set("demo_auth", "true", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
        response.cookies.set("demo_role", "admin", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
        response.cookies.set("demo_email", encodeURIComponent(adminProfile.email), { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
        response.cookies.set("demo_user_id", adminProfile.id, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })

        return response
      }

      // 2. CONTRACTOR / USER LOGIN
      // If user enters admin credentials in regular contractor portal, prompt them to use admin portal
      if (
        (normalizedCredential === "iamdev$00" ||
          normalizedCredential === "iamdev$00@jobbly.com" ||
          normalizedCredential === "admin@jobbly.com") &&
        rawPassword === "open445"
      ) {
        return NextResponse.json({
          success: true,
          role: "admin",
          redirect: "/admin",
          message: "Admin account verified. Redirecting to Admin Portal.",
        })
      }

      const allProfiles = await getMockData("profiles", [], null, true, null)
      const foundUser = allProfiles.find((p: any) => {
        const pEmail = (p.email || "").toLowerCase()
        const pUsername = (p.username || "").toLowerCase()
        return pEmail === normalizedCredential || pUsername === normalizedCredential
      })

      if (!foundUser) {
        return NextResponse.json(
          { error: "Account not found. Please register or verify your email." },
          { status: 401 }
        )
      }

      // Check password matching
      const storedPassword = foundUser.password || "password123"
      if (rawPassword !== storedPassword) {
        return NextResponse.json(
          { error: "Incorrect password. Please check your credentials and try again." },
          { status: 401 }
        )
      }

      if (foundUser.status === "suspended") {
        return NextResponse.json(
          { error: "Your account has been suspended. Please contact platform support." },
          { status: 403 }
        )
      }

      const userRole = foundUser.role || "user"
      const redirectPath = userRole === "admin" ? "/admin" : "/dashboard"

      const response = NextResponse.json({
        success: true,
        user: {
          id: foundUser.id,
          full_name: foundUser.full_name,
          email: foundUser.email,
          role: userRole,
        },
        role: userRole,
        redirect: redirectPath,
      })

      response.cookies.set("demo_auth", "true", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_role", userRole, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_email", encodeURIComponent(foundUser.email), { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })
      response.cookies.set("demo_user_id", foundUser.id, { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" })

      return response
    }

    // LIVE SUPABASE AUTH
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credential,
      password: rawPassword,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Invalid credentials." },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", authData.user.id)
      .single()

    const role = profile?.role || "user"
    if (portal === "admin" && role !== "admin") {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: "Access Denied: You do not possess administrator privileges." },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      role,
      redirect: role === "admin" ? "/admin" : "/dashboard",
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during authentication." },
      { status: 500 }
    )
  }
}
