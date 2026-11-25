"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { jobSchema, type JobFormData } from "@/lib/validations"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { TableSkeleton } from "@/components/loading-skeleton"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { Briefcase, Plus, Loader2 } from "lucide-react"

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = React.useState<any[]>([])
  const [clients, setClients] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("all")

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      title: "",
      client_id: "",
      job_type: "general",
      status: "pending",
      start_date: "",
      end_date: "",
      location: "",
      description: "",
      internal_notes: "",
    },
  })

  const loadData = React.useCallback(async () => {
    try {
      const [jobsRes, clientsRes] = await Promise.all([
        fetch(`/api/jobs?status=${activeTab}`),
        fetch("/api/clients"),
      ])

      if (!jobsRes.ok || !clientsRes.ok) throw new Error("Failed to load jobs data")

      const [jobsData, clientsData] = await Promise.all([
        jobsRes.json(),
        clientsRes.json(),
      ])

      setJobs(jobsData)
      setClients(clientsData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load jobs list")
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmit = async (data: JobFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Failed to save job")

      toast.success("Job added successfully!")
      setIsModalOpen(false)
      reset()
      loadData()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while creating job")
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<any>[] = [
    { key: "title", label: "Job Title", sortable: true, className: "font-semibold" },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (item) => item.client?.full_name || "Unknown",
    },
    { key: "job_type", label: "Type", className: "capitalize" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (item) => item.start_date ? formatDate(item.start_date) : "Not Set",
    },
  ]

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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Jobs"
        description="Schedule and track service requests, assignments, and operations."
        action={{
          label: "Add Job",
          onClick: () => {
            if (clients.length === 0) {
              toast.error("Please add a client first before scheduling a job.")
              router.push("/dashboard/clients")
              return
            }
            setIsModalOpen(true)
          },
          icon: Plus,
        }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => {
        setIsLoading(true)
        setActiveTab(val)
      }}>
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={`No ${activeTab !== 'all' ? activeTab + ' ' : ''}jobs found`}
          description="Schedule a contracting job for your clients and assign types."
          action={{
            label: "Create Job",
            onClick: () => {
              if (clients.length === 0) {
                toast.error("Please add a client first.")
                router.push("/dashboard/clients")
                return
              }
              setIsModalOpen(true)
            },
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={jobs}
          searchKey="title"
          searchPlaceholder="Search by job title..."
          onRowClick={(item) => router.push(`/dashboard/jobs/${item.id}`)}
          emptyMessage="No matching jobs found."
        />
      )}

      {/* Add Job Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl">Create New Job</DialogTitle>
            <DialogDescription>
              Provide scheduling and details about this new job assignment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
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
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating job...
                  </>
                ) : (
                  "Create Job"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
