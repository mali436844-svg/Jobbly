"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { businessProfileSchema, type BusinessProfileFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Building, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema) as any,
  })

  const loadProfile = React.useCallback(async () => {
    try {
      const res = await fetch("/api/settings/profile")
      if (!res.ok) throw new Error("Failed to load settings profile")
      const data = await res.json()
      setProfile(data)
      reset({
        business_name: data.business_name || "",
        business_email: data.business_email || "",
        business_phone: data.business_phone || "",
        business_address: data.business_address || "",
        business_city: data.business_city || "",
        business_state: data.business_state || "",
        business_zip: data.business_zip || "",
        default_tax_rate: Number(data.default_tax_rate || 0),
        default_payment_terms: data.default_payment_terms || "Net 30",
        default_invoice_notes: data.default_invoice_notes || "",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to load business profile")
    } finally {
      setIsLoading(false)
    }
  }, [reset])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const onSubmit = async (formData: BusinessProfileFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update profile settings")

      toast.success("Settings updated successfully!")
      loadProfile()
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-medium">Loading settings...</div>
  }

  const plans = [
    {
      name: "Free Trial",
      id: "free",
      price: "$0",
      description: "30-day trial with basic limits.",
      features: ["Max 5 clients", "Max 10 invoices", "Manual PDF downloads"],
    },
    {
      name: "Starter",
      id: "starter",
      price: "$29/mo",
      description: "Ideal for individual contractors.",
      features: ["Unlimited clients", "Unlimited invoices", "Premium PDF exports", "All core features"],
    },
    {
      name: "Pro",
      id: "pro",
      price: "$59/mo",
      description: "Complete email automation & payments.",
      features: ["Everything in Starter", "Transactional emails", "Payment tracking", "Sales reports"],
    },
  ]

  const currentPlanId = profile?.subscription_plan || "free"

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        description="Configure your contractor profile, billing preferences, default templates, and subscription."
      />

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-slate-100 p-1 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Business Profile</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Subscription</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading font-bold text-slate-800">Business Details</CardTitle>
                  <CardDescription>
                    Information used on your PDF estimates and invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="business_name">Business Name <span className="text-red-500">*</span></Label>
                    <Input id="business_name" {...register("business_name")} />
                    {errors.business_name && (
                      <p className="text-xs text-red-600 font-medium">{errors.business_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_email">Business Email</Label>
                    <Input id="business_email" type="email" placeholder="billing@yourbiz.com" {...register("business_email")} />
                    {errors.business_email && (
                      <p className="text-xs text-red-600 font-medium">{errors.business_email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input id="business_phone" placeholder="(555) 000-0000" {...register("business_phone")} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="business_address">Street Address</Label>
                    <Input id="business_address" placeholder="123 Industrial Dr" {...register("business_address")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_city">City</Label>
                    <Input id="business_city" placeholder="Houston" {...register("business_city")} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="business_state">State</Label>
                        <Input id="business_state" placeholder="TX" {...register("business_state")} />
                      </div>
                      <div>
                        <Label htmlFor="business_zip">ZIP</Label>
                        <Input id="business_zip" placeholder="77001" {...register("business_zip")} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing / Invoice Templates Defaults */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading font-bold text-slate-800">Billing Preferences</CardTitle>
                  <CardDescription>
                    Configure automatic default fields for quote & invoice builder calculations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                    <Input id="default_tax_rate" type="number" step="any" {...register("default_tax_rate", { valueAsNumber: true })} />
                    {errors.default_tax_rate && (
                      <p className="text-xs text-red-600 font-medium">{errors.default_tax_rate.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="default_payment_terms">Default Payment Terms</Label>
                    <Input id="default_payment_terms" placeholder="e.g. Net 30" {...register("default_payment_terms")} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="default_invoice_notes">Invoice Notes Template</Label>
                    <Textarea id="default_invoice_notes" placeholder="e.g. Thank you for choosing Apex Contracting!" {...register("default_invoice_notes")} />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Settings...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>

        {/* Subscription Plan Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {currentPlanId === "free" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">You are on the Free Trial</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your trial limits are: maximum 5 clients and 10 invoices. Upgrade to Starter or Pro to lift these limits and send emails!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlanId
              return (
                <Card key={plan.id} className={`flex flex-col relative ${
                  isCurrent ? "border-amber-500 ring-2 ring-amber-500/10 shadow-md" : "border-slate-200"
                }`}>
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      Current Plan
                    </span>
                  )}
                  <CardHeader className="text-center pt-8 pb-4">
                    <CardTitle className="text-lg font-heading font-bold text-slate-800">{plan.name}</CardTitle>
                    <div className="my-4">
                      <span className="text-3xl font-extrabold text-slate-900 font-heading">{plan.price}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    {isCurrent ? (
                      <Button className="w-full font-semibold" variant="secondary" disabled>
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full font-semibold ${plan.id !== 'free' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'}`}
                        onClick={() => {
                          toast.info(`Redirecting to Lemon Squeezy checkout for ${plan.name}...`)
                          window.open(`https://lemonsqueezy.com/checkout?store=your-store&plan=${plan.id}`, "_blank")
                        }}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
