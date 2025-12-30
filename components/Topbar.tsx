"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, ChevronRight, Settings, User, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/Sidebar"
import { useRouter } from "next/navigation"

interface TopbarProps {
  title: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function Topbar({ title, actions, breadcrumbs }: TopbarProps) {
  const { setIsMobileOpen } = useSidebar()
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4">
        {/* Left: Mobile Menu Button + Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden hover:bg-gray-100 rounded-lg h-8 w-8 flex-shrink-0 cursor-pointer"
            title="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>

          <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Center: Search - Hidden on mobile and tablet */}
        <div className="hidden xl:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Start searching here..."
              className="pl-10 bg-gray-50 border-gray-200 h-10 focus-visible:ring-blue-500 w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actions && <div className="flex items-center gap-1 sm:gap-2">{actions}</div>}

          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 rounded-lg h-8 w-8 sm:h-10 sm:w-10 cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-2 w-2 rounded-full bg-blue-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-gray-100 rounded-lg h-8 w-8 sm:h-10 sm:w-10 cursor-pointer"
            onClick={() => router.push('/dashboard/settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 rounded-lg h-8 w-8 sm:h-10 sm:w-10 cursor-pointer"
            onClick={() => router.push('/dashboard/profile')}
            title="My profile"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}

