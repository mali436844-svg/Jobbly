"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { TableSkeleton } from "@/components/loading-skeleton"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PDFTemplate } from "@/components/pdf-template"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Receipt, Plus, Eye, Trash2, Mail, CreditCard, Loader2 } from "lucide-react"

// Dynamic import of PDFViewer to prevent SSR crash
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false, loading: () => <p className="p-12 text-center text-sm">Loading PDF viewer...</p> }
)

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [businessProfile, setBusinessProfile] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Modals state
  const [previewInvoice, setPreviewInvoice] = React.useState<any>(null)
  const [payInvoice, setPayInvoice] = React.useState<any>(null)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [deleteInvoiceID, setDeleteInvoiceID] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isPaying, setIsPaying] = React.useState(false)
  const [, setIsUpdatingStatus] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset: resetPaymentForm,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: 0,
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  const loadInvoices = async () => {
    try {
      const [invoicesRes, profileRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/settings/profile"),
      ])

      if (!invoicesRes.ok) throw new Error("Failed to fetch invoices")
      const invoicesData = await invoicesRes.json()
      setInvoices(invoicesData)

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setBusinessProfile(profileData)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load invoices")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadInvoices()
  }, [])

  const handleDelete = async () => {
    if (!deleteInvoiceID) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/invoices/${deleteInvoiceID}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete invoice")

      toast.success("Invoice deleted successfully")
      loadInvoices()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting invoice")
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
      setDeleteInvoiceID(null)
    }
  }

  const handlePaySubmit = async (formData: PaymentFormData) => {
    if (!payInvoice) return
    setIsPaying(true)
    try {
      const res = await fetch(`/api/invoices/${payInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to register payment")

      toast.success("Payment registered successfully! Invoice marked as paid.")
      setPayInvoice(null)
      resetPaymentForm()
      loadInvoices()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while paying invoice")
    } finally {
      setIsPaying(false)
    }
  }

  const updateStatus = async (invoiceId: string, status: string) => {
    setIsUpdatingStatus(true)
    try {
      // Fetch full invoice details
      const getRes = await fetch(`/api/invoices/${invoiceId}`)
      const inv = await getRes.json()

      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: inv.client_id,
          job_id: inv.job_id || undefined,
          due_date: inv.due_date || undefined,
          tax_rate: Number(inv.tax_rate),
          notes: inv.notes || undefined,
          terms: inv.terms || undefined,
          items: inv.items.map((i: any) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit_price: Number(i.unit_price),
          })),
          status, // Override status in our custom action
        }),
      })

      if (!res.ok) throw new Error("Failed to update status")
      
      toast.success(`Invoice status updated to ${status}!`)
      loadInvoices()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const sendEmail = async (invoiceId: string) => {
    toast.promise(
      fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" }),
      {
        loading: "Compiling PDF and sending invoice email...",
        success: () => {
          updateStatus(invoiceId, "sent")
          return "Invoice successfully emailed to client via Resend!"
        },
        error: "Failed to send invoice email",
      }
    )
  }

  const columns: Column<any>[] = [
    { key: "invoice_number", label: "Invoice No.", sortable: true, className: "font-semibold" },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (item) => item.client?.full_name || "Private Client",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => (
        <span className={item.status === 'overdue' ? 'animate-pulse' : ''}>
          <StatusBadge status={item.status} />
        </span>
      ),
    },
    {
      key: "total",
      label: "Total Amount",
      sortable: true,
      className: "text-right font-semibold text-slate-900",
      render: (item) => (
        <span className={item.status === 'overdue' ? 'text-red-600 font-bold' : ''}>
          {formatCurrency(item.total)}
        </span>
      ),
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (item) => item.due_date ? formatDate(item.due_date) : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right w-48",
      render: (item) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={async () => {
              try {
                const res = await fetch(`/api/invoices/${item.id}`)
                const fullInv = await res.json()
                setPreviewInvoice(fullInv)
              } catch {
                toast.error("Failed to load invoice preview")
              }
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {item.status !== "paid" && item.status !== "cancelled" && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => {
                setPayInvoice(item)
                setValue("amount", Number(item.total))
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
            </Button>
          )}

          {item.status === "draft" && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => sendEmail(item.id)}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              setDeleteInvoiceID(item.id)
              setIsConfirmOpen(true)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Invoices"
        description="Create invoices, record payments, calculate sales taxes, and send overdue notices."
        action={{
          label: "New Invoice",
          onClick: () => router.push("/dashboard/invoices/new"),
          icon: Plus,
        }}
      />

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="Generate your first invoice for a contracting job and email PDF billing statements."
          action={{
            label: "Create Invoice",
            onClick: () => router.push("/dashboard/invoices/new"),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={invoices}
          searchKey="invoice_number"
          searchPlaceholder="Search invoices by number..."
          emptyMessage="No matching invoices found."
        />
      )}

      {/* PDF Preview Dialog */}
      {previewInvoice && (
        <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-6">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-xl">
                Invoice Preview: {previewInvoice.invoice_number}
              </DialogTitle>
              <DialogDescription>
                Live PDF compiled using @react-pdf/renderer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 rounded-lg border overflow-hidden mt-4">
              <PDFViewer className="w-full h-full border-none">
                <PDFTemplate
                  type="INVOICE"
                  docNumber={previewInvoice.invoice_number}
                  date={formatDate(previewInvoice.created_at)}
                  dueDate={previewInvoice.due_date ? formatDate(previewInvoice.due_date) : undefined}
                  businessProfile={businessProfile || { business_name: "My Contracting" }}
                  clientInfo={previewInvoice.client}
                  items={previewInvoice.items || []}
                  subtotal={Number(previewInvoice.subtotal)}
                  taxRate={Number(previewInvoice.tax_rate)}
                  taxAmount={Number(previewInvoice.tax_amount)}
                  total={Number(previewInvoice.total)}
                  notes={previewInvoice.notes}
                  terms={previewInvoice.terms}
                />
              </PDFViewer>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Pay Invoice Dialog */}
      {payInvoice && (
        <Dialog open={!!payInvoice} onOpenChange={() => setPayInvoice(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-xl">Record Payment</DialogTitle>
              <DialogDescription>
                Record a client payment for invoice {payInvoice.invoice_number}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handlePaySubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label>Payment Amount ($) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-600 font-medium">{errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Payment Method <span className="text-red-500">*</span></Label>
                  <Controller
                    name="payment_method"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Payment Date <span className="text-red-500">*</span></Label>
                  <Input type="date" {...register("payment_date")} />
                  {errors.payment_date && (
                    <p className="text-xs text-red-600 font-medium">{errors.payment_date.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Notes (Optional)</Label>
                  <Textarea placeholder="e.g. Check #1043 received on-site." {...register("notes")} />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setPayInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPaying}>
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Payment...
                    </>
                  ) : (
                    "Mark as Paid"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Invoice?"
        description="Are you absolutely sure you want to delete this invoice billing record? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete Invoice"}
        variant="destructive"
      />
    </div>
  )
}
