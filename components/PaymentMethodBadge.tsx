"use client"

import { PaymentMethod } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PaymentMethodBadgeProps {
  method: PaymentMethod
}

export function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const methodConfig = {
    cash: {
      label: "Cash",
      className: "bg-green-100 text-green-800",
    },
    card: {
      label: "Card",
      className: "bg-blue-100 text-blue-800",
    },
    upi: {
      label: "UPI",
      className: "bg-purple-100 text-purple-800",
    },
  }

  const config = methodConfig[method] || methodConfig.cash

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










