import { Badge } from "@/components/ui/badge"
import { SyncStatus, RepStatus, VanStatus, APIStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: SyncStatus | RepStatus | VanStatus | APIStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = () => {
    if (status === "success" || status === "active") {
      return "success"
    }
    if (status === "failed" || status === "inactive") {
      return "destructive"
    }
    if (status === "pending" || status === "processing" || status === "maintenance") {
      return "warning"
    }
    if (status === "on-leave") {
      return "secondary"
    }
    return "default"
  }

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Badge variant={getVariant()} className={className}>
      {formatStatus(status)}
    </Badge>
  )
}

