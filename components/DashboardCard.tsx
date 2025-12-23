import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface DashboardCardProps {
  title: string
  description?: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  progress?: number // 0-100 percentage for circular progress
  className?: string
  variant?: 'blue' | 'red' | 'green' | 'orange' | 'purple'
  featured?: boolean // For gradient background highlight
}

export function DashboardCard({
  title,
  description,
  value,
  icon,
  trend,
  progress,
  className,
  variant = 'blue',
  featured = false,
}: DashboardCardProps) {
  const gradientClass = `gradient-${variant}`
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = progress
    ? circumference - (progress / 100) * circumference
    : 0

  const trendColor = trend?.isPositive ? 'text-green-600' : 'text-red-600'

  return (
    <Card className={cn(
      "card-hover border border-gray-200 h-full overflow-hidden animate-scale-in",
      featured ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600" : "bg-white",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn("text-sm font-medium mb-1", featured ? "text-blue-100" : "text-slate-500")}>
              {title}
            </CardTitle>
            {description && (
              <p className="text-xs text-slate-400 mt-1">{description}</p>
            )}
          </div>
          {progress !== undefined && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="transform -rotate-90 w-20 h-20">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="progress-ring transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={variant === 'blue' ? '#1B60E8' : variant === 'red' ? '#EF4444' : variant === 'green' ? '#10B981' : variant === 'orange' ? '#F59E0B' : '#8B5CF6'} />
                    <stop offset="100%" stopColor={variant === 'blue' ? '#1450C9' : variant === 'red' ? '#DC2626' : variant === 'green' ? '#059669' : variant === 'orange' ? '#D97706' : '#7C3AED'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-700">{progress}%</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div>
            <div className={cn("text-3xl font-bold mb-1", featured ? "text-white" : "text-slate-900")}>{value}</div>
            {trend && (
              <div className="flex items-center gap-1.5">
                <span className={cn("text-xs font-semibold", featured ? "text-white" : trendColor)}>
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className={cn("text-xs", featured ? "text-blue-100" : "text-slate-400")}>vs last period</span>
              </div>
            )}
          </div>
          {icon && !progress && (
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", featured ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600")}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

