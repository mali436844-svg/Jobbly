import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusVariant = 
  | 'pending' | 'active' | 'completed' | 'cancelled'
  | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  | 'paid' | 'overdue'

const statusStyles: Record<StatusVariant, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-orange-100 text-orange-800 border-orange-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium",
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  )
}
