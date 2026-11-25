"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Sparkles, ShieldAlert, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionPaywallProps {
  onPlanActivated?: () => void
  reason?: "expired" | "limit_reached" | "required"
}

export function SubscriptionPaywall({
  onPlanActivated,
  reason = "required",
}: SubscriptionPaywallProps) {
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null)

  const handleSelectPlan = async (planId: "starter" | "pro") => {
    setLoadingPlan(planId)
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to activate subscription.")
        return
      }

      toast.success(`Welcome to Jobbly ${planId.toUpperCase()}! Your subscription is now active.`)
      if (onPlanActivated) {
        onPlanActivated()
      } else {
        window.location.reload()
      }
    } catch {
      toast.error("Could not process subscription. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto animate-fade-in text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4">
        {reason === "expired" ? (
          <ShieldAlert className="h-7 w-7 text-red-500" />
        ) : (
          <Sparkles className="h-7 w-7" />
        )}
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
        {reason === "expired"
          ? "Your Subscription Has Expired"
          : "Subscribe to Unlock Full Contractor Tools"}
      </h2>
      <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
        {reason === "expired"
          ? "Please renew your subscription to continue managing clients, jobs, quotes, and sending invoices."
          : "Select a professional subscription plan to activate unlimited job management, branded PDF invoicing, and automated client billing."}
      </p>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8 text-left">
        {/* Starter Plan */}
        <Card className="border-slate-200 hover:border-amber-400 transition-all hover:shadow-lg flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold font-heading text-slate-900">Starter</CardTitle>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Solo Contractor
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Essential management for independent trade contractors.
            </CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-heading">$29</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Unlimited Clients & Contact Directory</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Unlimited Active Jobs & Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Unlimited Professional Quotes & Estimates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>PDF Invoicing & Payment Tracking</span>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button
              className="w-full font-semibold bg-slate-900 hover:bg-slate-800 text-white"
              disabled={loadingPlan !== null}
              onClick={() => handleSelectPlan("starter")}
            >
              {loadingPlan === "starter" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Starter...
                </>
              ) : (
                <>
                  Subscribe to Starter <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-amber-400 ring-2 ring-amber-500/20 shadow-xl flex flex-col justify-between relative bg-gradient-to-b from-white to-amber-50/20">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
            Most Popular
          </span>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold font-heading text-slate-900">Pro Contractor</CardTitle>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Full Power
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Complete business automation with transactional email dispatch.
            </CardDescription>
            <div className="pt-3">
              <span className="text-3xl font-extrabold text-slate-900 font-heading">$79</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-900">Everything in Starter</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Resend Transactional Email with PDF Attachments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>1-Click Quote-to-Invoice Conversion</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Advanced Revenue & Performance Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Priority Customer Support</span>
            </div>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <Button
              className="w-full font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
              disabled={loadingPlan !== null}
              onClick={() => handleSelectPlan("pro")}
            >
              {loadingPlan === "pro" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Pro...
                </>
              ) : (
                <>
                  Subscribe to Pro <Sparkles className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
