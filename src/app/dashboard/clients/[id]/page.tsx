"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientSchema, type ClientFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { FormSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { User, Phone, Mail, Building, MapPin, Edit2, Trash2, Loader2, ArrowLeft } from "lucide-react"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientID = params.id as string

  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const loadClientDetails = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientID}`)
      if (!res.ok) throw new Error("Failed to load client details")
      const json = await res.json()
      setData(json)
      reset({
        full_name: json.full_name,
        email: json.email || "",
        phone: json.phone || "",
        company_name: json.company_name || "",
        address: json.address || "",
        city: json.city || "",
        state: json.state || "",
        zip: json.zip || "",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to load client details")
      router.push("/dashboard/clients")
    } finally {
      setIsLoading(false)
    }
  }, [clientID, reset, router])

  React.useEffect(() => {
    if (clientID) {
      loadClientDetails()
    }
  }, [clientID, loadClientDetails])

  const handleUpdate = async (formData: ClientFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update client")

      toast.success("Client details updated successfully!")
      setIsEditModalOpen(false)
      loadClientDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to update client")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${clientID}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete client")

      toast.success("Client deleted successfully")
      router.push("/dashboard/clients")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client")
      setIsConfirmOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  const client = data
  const jobs = client?.jobs || []
  const invoices = client?.invoices || []

  const jobColumns: Column<any>[] = [
    { key: "title", label: "Job Title", sortable: true, className: "font-semibold" },
    { key: "job_type", label: "Type", className: "capitalize" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "created_at",
      label: "Created Date",
      sortable: true,
      render: (item) => formatDate(item.created_at),
    },
  ]

  const invoiceColumns: Column<any>[] = [
    { key: "invoice_number", label: "Invoice No.", sortable: true, className: "font-semibold" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "total",
      label: "Amount",
      sortable: true,
      className: "text-right font-semibold text-slate-900",
      render: (item) => formatCurrency(item.total),
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: true,
      render: (item) => item.due_date ? formatDate(item.due_date) : "N/A",
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={client.full_name}
          description={client.company_name || "Private Client"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-heading font-bold">Client Profile</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="h-4 w-4 text-slate-600" />
              </Button>
              <Button variant="outline" size="icon" className="border-red-200 hover:bg-red-50" onClick={() => setIsConfirmOpen(true)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {client.company_name && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{client.company_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-800">{client.full_name}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p>{client.address}</p>
                  <p>{client.city}, {client.state} {client.zip}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client's Jobs and Invoices */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-bold">Jobs History</CardTitle>
              <CardDescription>All scheduling jobs linked to this client.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={jobColumns}
                data={jobs}
                onRowClick={(item) => router.push(`/dashboard/jobs/${item.id}`)}
                emptyMessage="No jobs found for this client."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-bold">Invoices History</CardTitle>
              <CardDescription>All invoices and billing details.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={invoiceColumns}
                data={invoices}
                onRowClick={(item) => router.push(`/dashboard/invoices/${item.id}`)}
                emptyMessage="No invoices found for this client."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Edit Client Details</DialogTitle>
            <DialogDescription>Update the client's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="full_name" placeholder="John Smith" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-red-600 font-medium">{errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@smith.com" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="(555) 000-0000" {...register("phone")} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" placeholder="Smith & Co" {...register("company_name")} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="123 Main St" {...register("address")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Austin" {...register("city")} />
              </div>
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="TX" {...register("state")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" placeholder="78701" {...register("zip")} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Client?"
        description="Are you absolutely sure you want to delete this client? All of their linked jobs, quotes, and invoices will also be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete Client"}
        variant="destructive"
      />
    </div>
  )
}
