"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TopbarProps {
  title: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function Topbar({ title, actions, breadcrumbs }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="flex flex-col sm:flex-row h-auto sm:h-20 items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-0 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-slate-900 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={cn(index === breadcrumbs.length - 1 && "text-slate-900 font-medium")}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">Manage your middleware system</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <div className="hidden sm:flex items-center gap-2">{actions}</div>
          <div className="hidden lg:flex items-center gap-2 border rounded-lg px-3 py-2 bg-slate-50">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="border-0 bg-transparent h-auto p-0 w-32 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
        </div>
        {/* Mobile Actions */}
        {actions && (
          <div className="flex sm:hidden items-center gap-2 w-full">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

