import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} size="sm" className="mt-2 sm:mt-0 h-9 sm:h-10 text-xs sm:text-sm w-full sm:w-auto">
          {action.icon && <action.icon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
