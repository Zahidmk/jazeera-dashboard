"use client"

import { OrderStatus, DeliveryStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: OrderStatus | DeliveryStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800",
    },
    "out-for-delivery": {
      label: "Out for Delivery",
      className: "bg-blue-100 text-blue-800",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-100 text-green-800",
    },
    "partially-delivered": {
      label: "Partially Delivered",
      className: "bg-orange-100 text-orange-800",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-800",
    },
    returned: {
      label: "Returned",
      className: "bg-purple-100 text-purple-800",
    },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-semibold rounded-full",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}










