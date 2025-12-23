"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, UserPlus, Box, CheckCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/mobile/home", icon: Home },
  { name: "Orders", href: "/mobile/orders", icon: ShoppingCart },
  { name: "Cash Sales", href: "/mobile/cash-sales", icon: Package },
  { name: "Leads", href: "/mobile/leads", icon: UserPlus },
  { name: "Stock", href: "/mobile/stock", icon: Box },
  { name: "Closing", href: "/mobile/closing", icon: CheckCircle },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-6 gap-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}










