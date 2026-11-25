"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { EmptyState } from "@/components/empty-state"
import { TableSkeleton } from "@/components/loading-skeleton"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PDFTemplate } from "@/components/pdf-template"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { FileText, Plus, Eye, Trash2, Mail, Check } from "lucide-react"

// Dynamic import of PDFViewer to avoid Next.js SSR document-not-defined errors
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false, loading: () => <p className="p-12 text-center text-sm">Loading PDF viewer...</p> }
)

function QuotesList() {
  const router = useRouter()
  const [quotes, setQuotes] = React.useState<any[]>([])
  const [businessProfile, setBusinessProfile] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Dialog state
  const [previewQuote, setPreviewQuote] = React.useState<any>(null)
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false)
  const [deleteQuoteID, setDeleteQuoteID] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [, setIsUpdatingStatus] = React.useState(false)

  const loadQuotes = async () => {
    try {
      const [quotesRes, profileRes] = await Promise.all([
        fetch("/api/quotes"),
        fetch("/api/settings/profile"), // profile fetch
      ])

      if (!quotesRes.ok) throw new Error("Failed to fetch quotes")
      const quotesData = await quotesRes.json()
      setQuotes(quotesData)

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setBusinessProfile(profileData)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load quotes")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadQuotes()
  }, [])

  const handleDelete = async () => {
    if (!deleteQuoteID) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/quotes/${deleteQuoteID}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete quote")

      toast.success("Quote deleted successfully")
      loadQuotes()
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting quote")
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
      setDeleteQuoteID(null)
    }
  }

  const updateStatus = async (quoteId: string, status: string) => {
    setIsUpdatingStatus(true)
    try {
      // Fetch full quote first
      const getRes = await fetch(`/api/quotes/${quoteId}`)
      const quote = await getRes.json()

      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: quote.client_id,
          job_id: quote.job_id || undefined,
          valid_until: quote.valid_until || undefined,
          tax_rate: Number(quote.tax_rate),
          notes: quote.notes || undefined,
          terms: quote.terms || undefined,
          items: quote.items.map((i: any) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit_price: Number(i.unit_price),
          })),
          status, // Override status in our custom action
        }),
      })

      if (!res.ok) throw new Error("Failed to update status")
      
      toast.success(`Quote status updated to ${status}!`)
      loadQuotes()
    } catch (err: any) {
      toast.error(err.message || "Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const sendEmail = async (quoteId: string) => {
    toast.promise(
      fetch(`/api/quotes/${quoteId}/send`, { method: "POST" }),
      {
        loading: "Compiling PDF and sending email...",
        success: () => {
          updateStatus(quoteId, "sent")
          return "Quote successfully sent to client via Resend!"
        },
        error: "Failed to send transactional email",
      }
    )
  }

  const columns: Column<any>[] = [
    { key: "quote_number", label: "Quote No.", sortable: true, className: "font-semibold" },
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
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "total",
      label: "Total Amount",
      sortable: true,
      className: "text-right font-semibold text-slate-900",
      render: (item) => formatCurrency(item.total),
    },
    {
      key: "valid_until",
      label: "Valid Until",
      sortable: true,
      render: (item) => item.valid_until ? formatDate(item.valid_until) : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right w-44",
      render: (item) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={async () => {
              try {
                const res = await fetch(`/api/quotes/${item.id}`)
                const fullQuote = await res.json()
                setPreviewQuote(fullQuote)
              } catch {
                toast.error("Failed to load preview details")
              }
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {item.status === 'draft' && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => sendEmail(item.id)}
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}

          {item.status === 'sent' && (
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => updateStatus(item.id, "accepted")}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              setDeleteQuoteID(item.id)
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
        title="Quotes"
        description="Build estimates, configure line items, manage proposals, and request approvals."
        action={{
          label: "New Quote",
          onClick: () => router.push("/dashboard/quotes/new"),
          icon: Plus,
        }}
      />

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotes found"
          description="Create your first contracting quote with dynamic line items and PDF templates."
          action={{
            label: "Create Quote",
            onClick: () => router.push("/dashboard/quotes/new"),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={quotes}
          searchKey="quote_number"
          searchPlaceholder="Search quotes by number..."
          emptyMessage="No matching quotes found."
        />
      )}

      {/* PDF Preview Modal */}
      {previewQuote && (
        <Dialog open={!!previewQuote} onOpenChange={() => setPreviewQuote(null)}>
          <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-6">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-xl">
                Quote Preview: {previewQuote.quote_number}
              </DialogTitle>
              <DialogDescription>
                Live PDF compiled using @react-pdf/renderer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 rounded-lg border overflow-hidden mt-4">
              <PDFViewer className="w-full h-full border-none">
                <PDFTemplate
                  type="QUOTE"
                  docNumber={previewQuote.quote_number}
                  date={formatDate(previewQuote.created_at)}
                  dueDate={previewQuote.valid_until ? formatDate(previewQuote.valid_until) : undefined}
                  businessProfile={businessProfile || { business_name: "My Contracting" }}
                  clientInfo={previewQuote.client}
                  items={previewQuote.items || []}
                  subtotal={Number(previewQuote.subtotal)}
                  taxRate={Number(previewQuote.tax_rate)}
                  taxAmount={Number(previewQuote.tax_amount)}
                  total={Number(previewQuote.total)}
                  notes={previewQuote.notes}
                  terms={previewQuote.terms}
                />
              </PDFViewer>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Quote?"
        description="Are you absolutely sure you want to delete this quote estimate? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete Quote"}
        variant="destructive"
      />
    </div>
  )
}

export default function QuotesPage() {
  return (
    <React.Suspense fallback={<TableSkeleton cols={6} />}>
      <QuotesList />
    </React.Suspense>
  )
}
