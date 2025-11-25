"use client"

import { Topbar } from "@/components/Topbar"
import { DashboardCard } from "@/components/DashboardCard"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { SyncRateChart } from "@/components/Charts/SyncRateChart"
import { SyncAttemptsChart } from "@/components/Charts/SyncAttemptsChart"
import { ErrorPieChart } from "@/components/Charts/ErrorPieChart"
import {
  getKPIs,
  dummySyncMetrics,
  dummyRecentActivities,
} from "@/lib/dummy-data"
import { format } from "date-fns"
import { Truck, Users, RefreshCw, AlertCircle, ListChecks, TrendingUp, Plus, Package, ShoppingCart } from "lucide-react"
import { RecentActivity } from "@/lib/types"

export default function DashboardPage() {
  const kpis = getKPIs()

  const errorDistribution = [
    { name: "Connection Timeout", value: 12 },
    { name: "Invalid Payload", value: 8 },
    { name: "Server Error", value: 5 },
    { name: "Network Error", value: 3 },
  ]

  const recentActivitiesColumns: Column<RecentActivity>[] = [
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Rep",
      accessor: (row) => row.repName || "-",
    },
    {
      header: "Van",
      accessor: (row) => row.vanCode || "-",
    },
    {
      header: "Message",
      accessor: (row) => row.message || "-",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Timestamp",
      accessor: (row) => format(row.timestamp, "MMM dd, yyyy HH:mm"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Dashboard"
        actions={
          <>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Van
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Rep
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          </>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* KPI Cards - Two Rows Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            title="Total Vans"
            value={kpis.totalVans}
            icon={<Truck className="h-5 w-5" />}
          />
          <DashboardCard
            title="Active Vans"
            value={kpis.activeVans}
            icon={<Truck className="h-5 w-5" />}
          />
          <DashboardCard
            title="Active Reps"
            value={kpis.activeReps}
            icon={<Users className="h-5 w-5" />}
          />
          <DashboardCard
            title="Today's Deliveries"
            value={kpis.todayDeliveries}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <DashboardCard
            title="Sync Success Rate"
            value={`${kpis.syncSuccessRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: 2, isPositive: true }}
          />
          <DashboardCard
            title="Failed Syncs"
            value={kpis.failedSyncs}
            icon={<AlertCircle className="h-5 w-5" />}
            trend={{ value: -5, isPositive: true }}
          />
          <DashboardCard
            title="Low Stock Vans"
            value={kpis.lowStockVans}
            icon={<Package className="h-5 w-5" />}
          />
          <DashboardCard
            title="Queue Items"
            value={kpis.totalQueueItems}
            icon={<ListChecks className="h-5 w-5" />}
          />
        </div>

        {/* Charts - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            <SyncRateChart data={dummySyncMetrics} />
          </div>
          <div className="lg:col-span-1">
            <ErrorPieChart data={errorDistribution} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          <SyncAttemptsChart data={dummySyncMetrics} />
        </div>

        {/* Recent Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Recent Activities</h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable data={dummyRecentActivities} columns={recentActivitiesColumns} />
          </div>
        </div>
      </div>
    </div>
  )
}

