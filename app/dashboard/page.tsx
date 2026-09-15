"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { DashboardCard } from "@/components/DashboardCard"
import { Button } from "@/components/ui/button"
import { Truck, Users, RefreshCw, Plus, UserPlus, TrendingUp, Banknote, Wallet, Loader2 } from "lucide-react"
import { VansDistributionChart } from "@/components/Charts/VansDistributionChart"
import { RepsDistributionChart } from "@/components/Charts/RepsDistributionChart"
import { TopPerformingVansChart } from "@/components/Charts/TopPerformingVansChart"
import { SyncSuccessRateChart } from "@/components/Charts/SyncSuccessRateChart"
import { apiCall } from "@/lib/api/client"

interface StatsResponse {
  drivers: { total: number }
  vans: { active: number; total: number; topByRevenue: { vanId: string; plateNumber: string; revenue: number }[] }
  usersByRole: { role: string; count: number }[]
  deliveries: { total: number; delivered: number; failed: number; pending: number; successRate: number }
  sales: { totalRevenue: number; todayRevenue: number; weekRevenue: number }
  stock: { totalProducts: number; lowStockAlerts: number }
  leads: { today: number; pendingApproval: number }
}

interface SyncLogRow {
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLogRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, logsRes] = await Promise.all([
        apiCall<{ success: boolean; data: StatsResponse }>("/api/v1/admin/stats"),
        apiCall<{ success: boolean; data: SyncLogRow[] }>("/api/v1/sync/logs?limit=100"),
      ])
      setStats(statsRes.data)
      setSyncLogs(logsRes.data)
    } catch {
      // leave stats/syncLogs as-is; cards below fall back to "-"
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const vansStatusData = stats
    ? [
        { name: "Active", value: stats.vans.active },
        { name: "Inactive", value: stats.vans.total - stats.vans.active },
      ].filter((d) => d.value > 0)
    : []

  const usersByRoleData = stats
    ? stats.usersByRole.map((r) => ({ name: r.role.charAt(0) + r.role.slice(1).toLowerCase(), value: r.count }))
    : []

  const topVansData = stats?.vans.topByRevenue.map((v) => ({ plateNumber: v.plateNumber, revenue: v.revenue })) ?? []

  const fmt = (n: number) => `SAR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Dashboard"
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="hidden xl:flex cursor-pointer"
              onClick={() => router.push('/dashboard/vans-reps')}
              title="Add new van"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Van
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hidden xl:flex cursor-pointer"
              onClick={() => router.push('/dashboard/routes')}
              title="Assign route to van"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Route
            </Button>

            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => router.push('/dashboard/sync')}
              title="Sync data now"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sync Now</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </>
        }
      />
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading dashboard...
          </div>
        ) : (
          <>
            {/* Sales Performance Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sales Performance</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Track your revenue and sales metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <DashboardCard
                  title="Total Sales"
                  value={stats ? fmt(stats.sales.totalRevenue) : "-"}
                  icon={<TrendingUp className="h-5 w-5" />}
                  variant="blue"
                  featured={true}
                />
                <DashboardCard
                  title="Today's Sales"
                  value={stats ? fmt(stats.sales.todayRevenue) : "-"}
                  icon={<Banknote className="h-5 w-5" />}
                  variant="blue"
                />
                <DashboardCard
                  title="Weekly Collection"
                  value={stats ? fmt(stats.sales.weekRevenue) : "-"}
                  icon={<Wallet className="h-5 w-5" />}
                  variant="blue"
                />
                <DashboardCard
                  title="Van Deliveries"
                  value={stats ? `${stats.deliveries.delivered} / ${stats.deliveries.total}` : "-"}
                  icon={<Truck className="h-5 w-5" />}
                  variant="green"
                />
              </div>
            </div>

            {/* Van Operations Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Van Operations</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Monitor vans, drivers, and routes</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <DashboardCard
                  title="Active Vans"
                  value={stats?.vans.active ?? "-"}
                  icon={<Truck className="h-5 w-5" />}
                  variant="blue"
                />
                <DashboardCard
                  title="Van Drivers"
                  value={stats?.drivers.total ?? "-"}
                  icon={<Users className="h-5 w-5" />}
                  variant="blue"
                />
                <DashboardCard
                  title="New Leads (Today)"
                  value={stats?.leads.today ?? "-"}
                  icon={<UserPlus className="h-5 w-5" />}
                  variant="blue"
                />
                <DashboardCard
                  title="Pending Approval"
                  value={stats?.leads.pendingApproval ?? "-"}
                  icon={<UserPlus className="h-5 w-5" />}
                  variant="orange"
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-5">
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Distribution Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <VansDistributionChart data={vansStatusData} />
                  <RepsDistributionChart data={usersByRoleData} />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Performance & Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TopPerformingVansChart data={topVansData} />
                  <SyncSuccessRateChart syncLogs={syncLogs} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
