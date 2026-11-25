"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, calculateLineItemTotal, calculateSubtotal, calculateTax, calculateTotal } from "@/lib/utils"
import { toast } from "sonner"
import { Loader2, Plus, Trash, ArrowLeft } from "lucide-react"

export default function NewInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = React.useState<any[]>([])
  const [allJobs, setAllJobs] = React.useState<any[]>([])
  const [filteredJobs, setFilteredJobs] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      client_id: "",
      job_id: "",
      due_date: "",
      tax_rate: 0,
      notes: "",
      terms: "Payment terms are Net 30 days upon invoice receipt.",
      items: [{ description: "", quantity: 1, unit_price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  // Load clients and jobs
  React.useEffect(() => {
    async function loadBuilderData() {
      try {
        const [clientsRes, jobsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/jobs"),
        ])

        if (!clientsRes.ok || !jobsRes.ok) throw new Error("Failed to load records")

        const [clientsData, jobsData] = await Promise.all([
          clientsRes.json(),
          jobsRes.json(),
        ])

        setClients(clientsData)
        setAllJobs(jobsData)
      } catch {
        toast.error("Failed to initialize builder data")
      } finally {
        setIsLoading(false)
      }
    }
    loadBuilderData()
  }, [])

  // Watch fields for math
  const watchedItems = watch("items")
  const watchedTaxRate = watch("tax_rate") || 0
  const watchedClient = watch("client_id")

  // Filter jobs based on client
  React.useEffect(() => {
    if (watchedClient) {
      const jobsForClient = allJobs.filter((job) => job.client_id === watchedClient)
      setFilteredJobs(jobsForClient)
      setValue("job_id", "")
    } else {
      setFilteredJobs([])
    }
  }, [watchedClient, allJobs, setValue])

  // Recalculate totals
  const subtotal = React.useMemo(() => {
    return calculateSubtotal(watchedItems || [])
  }, [watchedItems])

  const taxAmount = React.useMemo(() => {
    return calculateTax(subtotal, watchedTaxRate)
  }, [subtotal, watchedTaxRate])

  const grandTotal = React.useMemo(() => {
    return calculateTotal(subtotal, taxAmount)
  }, [subtotal, taxAmount])

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.error === "limit_reached") {
          toast.error(result.message)
          router.push("/dashboard/settings")
          return
        }
        throw new Error(result.error || "Failed to create invoice")
      }

      toast.success("Invoice created successfully!")
      router.push("/dashboard/invoices")
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving the invoice")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-medium">Loading invoice builder...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Create New Invoice"
          description="Build professional, compliant billing statements with automated tax calculations."
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Select */}
            <div className="space-y-1.5">
              <Label>Select Client <span className="text-red-500">*</span></Label>
              <Controller
                name="client_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.full_name} {c.company_name ? `(${c.company_name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.client_id && (
                <p className="text-xs text-red-600 font-medium">{errors.client_id.message}</p>
              )}
            </div>

            {/* Linked Job */}
            <div className="space-y-1.5">
              <Label>Linked Job (Optional)</Label>
              <Controller
                name="job_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!watchedClient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={watchedClient ? "Choose Job" : "Select client first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
          </CardContent>
        </Card>

        {/* Line Items Block */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-800 border-b pb-2">Line Items</h3>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end border-b md:border-none pb-4 md:pb-0">
                  <div className="flex-1 w-full space-y-1.5">
                    {index === 0 && <Label>Description</Label>}
                    <Input
                      placeholder="e.g. Copper Pipe Repair"
                      {...register(`items.${index}.description` as const)}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-[10px] text-red-600 font-medium">{errors.items[index]?.description?.message}</p>
                    )}
                  </div>
                  
                  <div className="w-full md:w-28 space-y-1.5">
                    {index === 0 && <Label>Quantity</Label>}
                    <Input
                      type="number"
                      step="any"
                      placeholder="1"
                      {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-[10px] text-red-600 font-medium">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div className="w-full md:w-36 space-y-1.5">
                    {index === 0 && <Label>Unit Price ($)</Label>}
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...register(`items.${index}.unit_price` as const, { valueAsNumber: true })}
                    />
                    {errors.items?.[index]?.unit_price && (
                      <p className="text-[10px] text-red-600 font-medium">{errors.items[index]?.unit_price?.message}</p>
                    )}
                  </div>

                  <div className="w-full md:w-36 space-y-1.5">
                    {index === 0 && <Label>Total</Label>}
                    <div className="h-10 border rounded-md bg-slate-50 flex items-center px-3 text-sm font-semibold text-slate-800">
                      {formatCurrency(calculateLineItemTotal(watchedItems?.[index]?.quantity || 0, watchedItems?.[index]?.unit_price || 0))}
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="text-red-500 border-red-100 hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-xs font-semibold"
              onClick={() => append({ description: "", quantity: 1, unit_price: 0 })}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Line Item
            </Button>
          </CardContent>
        </Card>

        {/* Calculations and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Invoice Notes (Visible to Client)</Label>
                <Textarea placeholder="Thank you for your business!" {...register("notes")} />
              </div>
              <div className="space-y-1.5">
                <Label>Terms & Conditions</Label>
                <Textarea {...register("terms")} />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Math Widget */}
          <Card className="h-fit">
            <CardContent className="p-6 space-y-4 text-sm">
              <h3 className="font-bold text-slate-800 font-heading">Total Calculations</h3>
              
              <div className="space-y-2 border-b pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tax Rate (%):</span>
                  <Input
                    type="number"
                    step="any"
                    className="w-20 h-8 text-right font-medium text-xs border-slate-200"
                    {...register("tax_rate", { valueAsNumber: true })}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Calculated Tax:</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-950 font-heading pt-2">
                <span>Grand Total:</span>
                <span className="text-amber-500">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="pt-4 border-t flex flex-col gap-2">
                <Button type="submit" className="w-full font-semibold" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Draft...
                    </>
                  ) : (
                    "Save Invoice"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
