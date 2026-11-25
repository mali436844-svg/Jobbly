import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className="p-3.5 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <p className="text-[11px] sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] sm:text-xs font-medium",
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">{trend.value}% from last month</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-amber-50 p-2 sm:p-3 shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
