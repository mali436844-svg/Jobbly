import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  const pathname = request.nextUrl.pathname

  // DEMO MODE AUTH (when Supabase is not configured)
  if (isPlaceholder) {
    const demoAuth = request.cookies.get("demo_auth")?.value
    const demoRole = request.cookies.get("demo_role")?.value

    // Authenticated user trying to access login/register - redirect to dashboard
    if (demoAuth === "true" && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone()
      url.pathname = demoRole === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin already authenticated trying to access admin login - redirect to admin dashboard
    if (demoAuth === "true" && demoRole === "admin" && pathname === '/admin/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Protect /dashboard routes - require authentication
    if (pathname.startsWith('/dashboard') && demoAuth !== "true") {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Protect /admin routes (except /admin/login) - require admin role
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      if (demoAuth !== "true" || demoRole !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  }

  // LIVE SUPABASE AUTH
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users away from admin (except admin login)
  if (!user && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
