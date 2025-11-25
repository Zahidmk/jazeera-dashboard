import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface DashboardCardProps {
  title: string
  description?: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function DashboardCard({
  title,
  description,
  value,
  icon,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200 bg-white h-full",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
        <CardTitle className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide line-clamp-2">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 ml-2">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2 sm:pt-0">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mb-2 hidden sm:block">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2 sm:mt-3">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            )}
            <p
              className={cn(
                "text-xs font-semibold",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

