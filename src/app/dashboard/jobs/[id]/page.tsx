"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { jobSchema, type JobFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { FormSkeleton } from "@/components/loading-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Briefcase,
  MapPin,
  Calendar,
  User,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  FileText,
  Receipt,
  Plus,
} from "lucide-react"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobID = params.id as string

  const [data, setData] = React.useState<any>(null)
  const [clients, setClients] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,
  })

  const loadJobDetails = React.useCallback(async () => {
    try {
      const [jobRes, clientsRes] = await Promise.all([
        fetch(`/api/jobs/${jobID}`),
        fetch("/api/clients"),
      ])

      if (!jobRes.ok || !clientsRes.ok) throw new Error("Failed to load job details")

      const [jobJson, clientsJson] = await Promise.all([
        jobRes.json(),
        clientsRes.json(),
      ])

      setData(jobJson)
      setClients(clientsJson)

      reset({
        title: jobJson.title,
        client_id: jobJson.client_id,
        job_type: jobJson.job_type,
        status: jobJson.status,
        start_date: jobJson.start_date || "",
        end_date: jobJson.end_date || "",
        location: jobJson.location || "",
        description: jobJson.description || "",
        internal_notes: jobJson.internal_notes || "",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to load job details")
      router.push("/dashboard/jobs")
    } finally {
      setIsLoading(false)
    }
  }, [jobID, reset, router])

  React.useEffect(() => {
    if (jobID) {
      loadJobDetails()
    }
  }, [jobID, loadJobDetails])

  const handleUpdate = async (formData: JobFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/jobs/${jobID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update job")

      toast.success("Job details updated successfully!")
      setIsEditModalOpen(false)
      loadJobDetails()
    } catch (err: any) {
      toast.error(err.message || "Failed to update job")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/jobs/${jobID}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete job")

      toast.success("Job deleted successfully")
      router.push("/dashboard/jobs")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job")
      setIsConfirmOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  const job = data
  const quotes = job?.quotes || []
  const invoices = job?.invoices || []

  const jobTypes = [
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "painting", label: "Painting" },
    { value: "roofing", label: "Roofing" },
    { value: "hvac", label: "HVAC" },
    { value: "general", label: "General" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/jobs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={job.title}
          description={`${job.job_type.toUpperCase()} • Client: ${job.client?.full_name}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Details Card */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-500" /> Job Information
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                  <Edit2 className="h-4 w-4 text-slate-600" />
                </Button>
                <Button variant="outline" size="icon" className="border-red-200 hover:bg-red-50" onClick={() => setIsConfirmOpen(true)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <User className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">CLIENT</span>
                    <span className="font-semibold text-slate-800">{job.client?.full_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">SCHEDULE</span>
                    <span className="font-semibold text-slate-800">
                      {job.start_date ? formatDate(job.start_date) : "Not Set"}
                      {job.end_date ? ` to ${formatDate(job.end_date)}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">LOCATION</span>
                    <span className="font-semibold text-slate-800">{job.location || "On-site"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="shrink-0"><StatusBadge status={job.status} /></div>
                  <div>
                    <span className="text-xs text-slate-400 block">STATUS</span>
                    <span className="text-slate-800 font-semibold capitalize">{job.status}</span>
                  </div>
                </div>
              </div>

              {job.description && (
                <div className="border-t pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Description</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              )}

              {job.internal_notes && (
                <div className="border-t pt-4 bg-amber-50/40 p-3 rounded-lg border border-amber-100/50">
                  <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">Internal Notes (Private)</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.internal_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-heading font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" /> Linked Quotes
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => router.push(`/dashboard/quotes?client_id=${job.client_id}&job_id=${job.id}`)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Quote
                </Button>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No quotes linked to this job yet.</p>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((q: any) => (
                      <div
                        key={q.id}
                        className="flex justify-between items-center text-xs border-b pb-2 last:border-none cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                        onClick={() => router.push(`/dashboard/quotes`)}
                      >
                        <span className="font-semibold text-slate-800">{q.quote_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatCurrency(q.total)}</span>
                          <StatusBadge status={q.status} className="text-[9px] py-0 px-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-heading font-bold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-amber-500" /> Linked Invoices
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => router.push(`/dashboard/invoices?client_id=${job.client_id}&job_id=${job.id}`)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Invoice
                </Button>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No invoices linked to this job yet.</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv: any) => (
                      <div
                        key={inv.id}
                        className="flex justify-between items-center text-xs border-b pb-2 last:border-none cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
                        onClick={() => router.push(`/dashboard/invoices`)}
                      >
                        <span className="font-semibold text-slate-800">{inv.invoice_number}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatCurrency(inv.total)}</span>
                          <StatusBadge status={inv.status} className="text-[9px] py-0 px-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contractor Checklist / Quick actions */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base font-heading font-bold">Quick Actions</CardTitle>
            <CardDescription>Workflow helpers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full text-xs font-semibold justify-start bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => router.push(`/dashboard/quotes`)}
            >
              <FileText className="h-4 w-4 mr-2" /> Build Quote for Client
            </Button>
            <Button
              className="w-full text-xs font-semibold justify-start bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => router.push(`/dashboard/invoices`)}
            >
              <Receipt className="h-4 w-4 mr-2" /> Generate Invoice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Job Modal Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Edit Job Details</DialogTitle>
            <DialogDescription>Update the scheduling and operations of this job.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="e.g. Living Room Repainting" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client_id">Client <span className="text-red-500">*</span></Label>
                <Controller
                  name="client_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Client" />
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

              <div className="space-y-1.5">
                <Label htmlFor="job_type">Job Type</Label>
                <Controller
                  name="job_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Address / Location</Label>
                <Input id="location" placeholder="e.g. 123 Main St, Suite B" {...register("location")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" {...register("start_date")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea id="description" placeholder="Provide details about the workload, tools, etc." {...register("description")} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="internal_notes">Internal Notes (Private)</Label>
                <Textarea id="internal_notes" placeholder="Notes seen only by you and staff" {...register("internal_notes")} />
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
        title="Delete Job?"
        description="Are you absolutely sure you want to delete this job scheduling? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete Job"}
        variant="destructive"
      />
    </div>
  )
}
