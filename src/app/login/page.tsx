"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Hammer, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: data.email.trim(),
          password: data.password,
          portal: "user",
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Invalid credentials. Please try again.")
        return
      }

      toast.success(result.message || "Welcome back! Redirecting...")
      router.push(result.redirect || "/dashboard")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-amber-500 text-white shadow-md mb-3">
            <Hammer className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            Jobbly
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Job management & invoicing for professional contractors
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-slate-900 font-semibold font-heading">Sign In</CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Enter your email or username and password to access your dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 text-sm">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@business.com or username"
                  disabled={isLoading}
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 text-sm">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full font-semibold h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-xs sm:text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                  Create one now
                </Link>
              </div>
              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-[11px] text-slate-400 hover:text-amber-500 transition-colors"
                >
                  Admin Portal Login →
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
