"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Truck,
  Users,
  Repeat,
  ListChecks,
  Code,
  Settings,
  Menu,
  X,
  UserCog,
  MapPin,
  Package,
  ShoppingCart,
  DollarSign,
  UserPlus,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vans & Reps", href: "/dashboard/vans-reps", icon: Truck },
  { name: "Users & Roles", href: "/dashboard/users", icon: UserCog },

  { name: "Routes", href: "/dashboard/routes", icon: MapPin },
  // { name: "Stock Management", href: "/dashboard/stock", icon: Package },
  // { name: "Orders & Deliveries", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Cash Sales", href: "/dashboard/cash-sales", icon: DollarSign },
  // { name: "Leads & Customers", href: "/dashboard/leads", icon: UserPlus },
  // { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  // { name: "Relay Reps", href: "/dashboard/relay-reps", icon: Users },
  // { name: "Sync Queue & Logs", href: "/dashboard/sync", icon: ListChecks },
  // { name: "API Endpoints", href: "/dashboard/api-endpoints", icon: Code },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen} side="left">
        <SheetContent onClose={() => setIsMobileOpen(false)} className="w-20 p-0 bg-gray-900 border-gray-800">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
              <div className="h-12 w-12 rounded-lg flex items-center justify-center p-1.5">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-center h-12 w-12 rounded-lg transition-all duration-200 mx-auto",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                      title={item.name}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-20 lg:fixed lg:inset-y-0 lg:border-r lg:bg-gray-900 lg:border-gray-800">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-center h-16 border-b border-gray-800">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center p-1.5">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <nav className="p-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center h-12 w-12 rounded-lg transition-all duration-200 mx-auto group relative",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                    title={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                    {/* Tooltip on hover */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>
          <div className="p-2 border-t border-gray-800">
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-800 mx-auto">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

