"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Crown,
  Menu,
  X,
  Radio
} from "lucide-react"
import { toast } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Close mobile drawer on path change
  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // If on admin login page, don't wrap with admin navigation
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      document.cookie = "demo_auth=; Max-Age=0; path=/;"
      document.cookie = "demo_role=; Max-Age=0; path=/;"
      document.cookie = "demo_email=; Max-Age=0; path=/;"
      document.cookie = "demo_user_id=; Max-Age=0; path=/;"
      toast.success("Administrator session ended")
      router.push("/admin/login")
      router.refresh()
    } catch {
      router.push("/admin/login")
    }
  }

  const navItems = [
    { label: "Admin Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Registered Users", href: "/admin/users", icon: Users },
    { label: "Subscriptions & MRR", href: "/admin/subscriptions", icon: CreditCard },
    { label: "System Controls", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans w-full overflow-x-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Crown className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base font-extrabold tracking-tight text-white leading-none">Jobbly</span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase mt-0.5">Admin Portal</span>
            </div>
          </Link>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {!isActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white justify-between text-xs font-semibold"
          >
            <Link href="/dashboard">
              <span>Switch to User View</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 border border-amber-500/30 shrink-0">
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs font-bold">DEV</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">iamdev$00</span>
                <span className="text-[10px] text-slate-500 truncate">iamdev$00@jobbly.com</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-72 max-w-[80vw] bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 relative z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
              <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-lg text-white font-heading">Admin Portal</span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold justify-between"
              >
                <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                  <span>Switch to User View</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out Administrator</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 focus:outline-none"
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 sm:px-3 py-1 rounded-full font-mono font-medium">
              <Radio className="h-3 w-3 animate-pulse text-amber-400" />
              <span className="hidden sm:inline">Live Admin Engine</span>
              <span className="sm:hidden">Admin Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors bg-slate-800/80 px-2.5 py-1.5 rounded-md border border-slate-700"
            >
              <span>User App</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
