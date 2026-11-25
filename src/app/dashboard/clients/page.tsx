"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientSchema, type ClientFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { TableSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Users, Plus, Loader2 } from "lucide-react"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      company_name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  })

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients")
      if (!res.ok) throw new Error("Failed to load clients")
      const data = await res.json()
      setClients(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load clients list")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadClients()
  }, [])

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.error === "limit_reached") {
          toast.error(result.message)
          setIsModalOpen(false)
          router.push("/dashboard/settings")
          return
        }
        throw new Error(result.error || "Failed to save client")
      }

      toast.success("Client added successfully!")
      setIsModalOpen(false)
      reset()
      loadClients()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while creating client")
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<any>[] = [
    { key: "full_name", label: "Full Name", sortable: true, className: "font-semibold" },
    { key: "company_name", label: "Company", sortable: true },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "total_jobs",
      label: "Jobs",
      sortable: true,
      className: "text-center",
      render: (item) => item.total_jobs || 0,
    },
    {
      key: "total_billed",
      label: "Total Billed",
      sortable: true,
      className: "text-right font-semibold text-slate-900",
      render: (item) => formatCurrency(item.total_billed || 0),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clients"
        description="Manage your business customers and view their billing histories."
        action={{
          label: "Add Client",
          onClick: () => setIsModalOpen(true),
          icon: Plus,
        }}
      />

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Create your first client to start assigning jobs, quotes, and invoices."
          action={{
            label: "Create Client",
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          searchKey="full_name"
          searchPlaceholder="Search by client name..."
          onRowClick={(item) => router.push(`/dashboard/clients/${item.id}`)}
          emptyMessage="No matching clients found."
        />
      )}

      {/* Add Client Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Add New Client</DialogTitle>
            <DialogDescription>
              Provide the client's information. Click save when you are finished.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <DialogFooter className="gap-2 sm:gap-0 border-t pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding client...
                  </>
                ) : (
                  "Save Client"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
