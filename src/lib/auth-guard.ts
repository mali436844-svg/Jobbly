import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { Profile } from "@/lib/types"

export interface AuthSession {
  user: {
    id: string
    email?: string
  } | null
  profile: Profile | null
  isAdmin: boolean
  isUser: boolean
}

/**
 * Resolves the authenticated user and their profile across both
 * production Supabase auth and sandbox/demo mode.
 */
export async function getCurrentSession(): Promise<AuthSession> {
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  if (isPlaceholder) {
    try {
      const cookieStore = await cookies()
      const hasDemoAuth = cookieStore.get("demo_auth")?.value === "true"
      const demoRole = (cookieStore.get("demo_role")?.value || "user") as 'admin' | 'user'
      const demoEmail = cookieStore.get("demo_email")?.value
        ? decodeURIComponent(cookieStore.get("demo_email")!.value)
        : (demoRole === "admin" ? "admin@jobbly.com" : "alex@apexelectric.com")

      if (!hasDemoAuth) {
        return { user: null, profile: null, isAdmin: false, isUser: false }
      }

      const supabase = await createClient()
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", demoEmail)

      const profile = profiles && profiles.length > 0 ? profiles[0] : null
      const isAdmin = demoRole === "admin" || profile?.role === "admin"

      return {
        user: {
          id: profile?.id || (isAdmin ? "admin-user-id" : "demo-user-id"),
          email: demoEmail,
        },
        profile,
        isAdmin,
        isUser: !isAdmin,
      }
    } catch (e) {
      console.warn("Error resolving sandbox session:", e)
      return { user: null, profile: null, isAdmin: false, isUser: false }
    }
  }

  // Production Supabase Auth
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, profile: null, isAdmin: false, isUser: false }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile as Profile | null,
      isAdmin,
      isUser: profile?.role === "user",
    }
  } catch (e) {
    console.error("Error resolving production session:", e)
    return { user: null, profile: null, isAdmin: false, isUser: false }
  }
}

/**
 * Server-side guard to strictly enforce administrator authorization.
 * Returns 401 if unauthenticated or 403 if authenticated user is not an admin.
 */
export async function requireAdmin(): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; response: NextResponse }
> {
  const session = await getCurrentSession()

  if (!session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized. Admin authentication required." },
        { status: 401 }
      ),
    }
  }

  if (!session.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden. Super Admin privileges required." },
        { status: 403 }
      ),
    }
  }

  return { authorized: true, session }
}

/**
 * Server-side guard to enforce authenticated user / contractor session.
 */
export async function requireUser(): Promise<
  | { authorized: true; session: AuthSession }
  | { authorized: false; response: NextResponse }
> {
  const session = await getCurrentSession()

  if (!session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized. Please sign in to your contractor account." },
        { status: 401 }
      ),
    }
  }

  return { authorized: true, session }
}
