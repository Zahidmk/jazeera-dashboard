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
import { createContext, useContext, useState, ReactNode } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vans & Reps", href: "/dashboard/vans-reps", icon: Truck },
  { name: "Users & Roles", href: "/dashboard/users", icon: UserCog },

  { name: "Routes", href: "/dashboard/routes", icon: MapPin },
  { name: "Stock Management", href: "/dashboard/stock", icon: Package },
  // { name: "Orders & Deliveries", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Cash Sales", href: "/dashboard/cash-sales", icon: DollarSign },
  // { name: "Leads & Customers", href: "/dashboard/leads", icon: UserPlus },
  // { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  // { name: "Sync Queue & Logs", href: "/dashboard/sync", icon: ListChecks },
  // { name: "API Endpoints", href: "/dashboard/api-endpoints", icon: Code },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Create context for sidebar state
interface SidebarContextType {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isMobileOpen, setIsMobileOpen } = useSidebar()

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen} side="left">
        <SheetContent className="w-64 p-0 bg-gray-900 border-gray-800">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center p-1.5 bg-gray-800">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">Dashboard</h2>
                  <p className="text-gray-400 text-xs">Middleware System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-3 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-400">System Online</span>
              </div>
            </div>
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

