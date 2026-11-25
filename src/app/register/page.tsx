"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Hammer, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          businessName: data.businessName,
          email: data.email.trim(),
          password: data.password,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || "Failed to register. Please try again.")
        return
      }

      toast.success("Account created successfully! Welcome to Jobbly.")
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
            Create Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Get started with Jobbly in seconds
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl text-slate-900 font-semibold font-heading">Business Info</CardTitle>
            <CardDescription className="text-slate-500 text-xs sm:text-sm">
              Sign up today and get your 30-day free trial.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-slate-700 text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. John Smith"
                  disabled={isLoading}
                  className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 font-medium">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-slate-700 text-sm">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Apex Electric"
                  disabled={isLoading}
                  className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                  {...register("businessName")}
                />
                {errors.businessName && (
                  <p className="text-xs text-red-600 font-medium">{errors.businessName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@business.com"
                  disabled={isLoading}
                  className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 text-sm">Password</Label>
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
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-700 text-sm">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    disabled={isLoading}
                    className="border-slate-200 focus:ring-amber-500 h-10 sm:h-11 text-sm"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full font-semibold h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
              <div className="text-center text-xs sm:text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
