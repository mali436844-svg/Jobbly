"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { adminLoginSchema, type AdminLoginFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Crown, ShieldCheck, Loader2, Lock, ArrowLeft, KeyRound, UserCheck } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: data.email.trim(),
          password: data.password,
          portal: "admin",
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Authentication failed. Access Denied.")
        return
      }

      toast.success("Super Administrator verified successfully!")
      router.push(result.redirect || "/admin")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred during admin authentication.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 sm:py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
        {/* Portal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 mb-3 sm:mb-4 ring-4 ring-amber-500/10">
            <Crown className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading">
            Jobbly Admin Portal
          </h1>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-mono tracking-wide uppercase">
            Restricted Gateway • System Administrators Only
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base sm:text-lg font-heading font-semibold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" /> Authorized Admin Sign In
              </CardTitle>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <ShieldCheck className="h-3 w-3" /> Secure Access
              </span>
            </div>
            <CardDescription className="text-slate-400 text-xs">
              Enter your verified system admin username or email and master password to proceed.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-amber-400" /> Admin Username / Email
                </Label>
                <Input
                  id="admin-email"
                  type="text"
                  placeholder="e.g. iamdev$00"
                  disabled={isLoading}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:ring-amber-500/20 text-sm h-10 sm:h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" /> Admin Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:ring-amber-500/20 text-sm h-10 sm:h-11"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="rounded-lg bg-amber-950/20 border border-amber-800/30 p-3 text-[11px] text-amber-300/80 leading-relaxed">
                Security Policy: All administrator sessions and backend data modifications are strictly verified and logged.
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg shadow-amber-500/20 h-10 sm:h-11 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  "Authenticate Administrator"
                )}
              </Button>

              <div className="text-center pt-2 border-t border-slate-800/80 w-full">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> Contractor user? Go to App Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
