"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Hammer,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<any>(null)

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch {
        // silent fail for profile load
      }
    }
    loadProfile()
  }, [])

  // Close mobile drawer on path change
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      // Also clear cookies client-side as a safety measure
      document.cookie = "demo_auth=; Max-Age=0; path=/;"
      document.cookie = "demo_role=; Max-Age=0; path=/;"
      document.cookie = "demo_email=; Max-Age=0; path=/;"
      document.cookie = "demo_user_id=; Max-Age=0; path=/;"
      toast.success("Successfully logged out")
      router.push("/login")
      router.refresh()
    } catch {
      router.push("/login")
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Clients", href: "/dashboard/clients", icon: Users },
    { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Quotes", href: "/dashboard/quotes", icon: FileText },
    { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  const businessName = profile?.business_name || "My Business"
  const initials = businessName.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500 text-white shadow-sm">
              <Hammer className="h-4 w-4" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-white">Jobbly</span>
          </Link>
          {profile?.subscription_plan === "free" && (
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 animate-pulse">
              <Sparkles className="h-2.5 w-2.5" /> Trial
            </span>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {!isActive && (
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-slate-800/60 transition-colors focus:outline-none">
                <Avatar className="h-9 w-9 border border-slate-700">
                  <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{businessName}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.email || "contractor@jobbly.com"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem asChild className="focus:bg-slate-800 focus:text-slate-100">
                <Link href="/dashboard/settings" className="w-full">Business Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-slate-800 focus:text-slate-100">
                <Link href="/dashboard/settings" className="w-full">Billing & Subscription</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-950/20 focus:text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-72 max-w-[80vw] bg-slate-900 text-slate-200 flex flex-col shadow-2xl relative z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="h-16 px-6 flex items-center border-b border-slate-800">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500 text-white">
                  <Hammer className="h-4 w-4" />
                </div>
                <span className="font-heading text-lg font-bold tracking-tight text-white">Jobbly</span>
              </Link>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-amber-500 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
              {profile && (
                <div className="flex items-center gap-2.5 px-2 py-1.5">
                  <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
                    <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{businessName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header - Mobile */}
        <header className="h-14 sm:h-16 px-3 sm:px-4 md:px-8 border-b border-slate-200/80 bg-white flex items-center justify-between md:justify-end sticky top-0 z-35">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {profile?.subscription_plan === "free" && (
              <Button asChild size="sm" variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold text-xs hidden sm:flex">
                <Link href="/dashboard/settings" className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Upgrade Plan
                </Link>
              </Button>
            )}
            <Avatar className="h-8 w-8 md:hidden">
              <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dynamic Inner Page */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl w-full mx-auto animate-fade-in overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
