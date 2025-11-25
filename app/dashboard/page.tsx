"use client"

import { Topbar } from "@/components/Topbar"
import { DashboardCard } from "@/components/DashboardCard"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { VansDistributionChart } from "@/components/Charts/VansDistributionChart"
import { RepsDistributionChart } from "@/components/Charts/RepsDistributionChart"
import {
  getKPIs,
  dummyVans,
  dummyReps,
  dummyRecentActivities,
} from "@/lib/dummy-data"
import { format } from "date-fns"
import { Truck, Users, RefreshCw, Plus, ShoppingCart } from "lucide-react"
import { RecentActivity, Van, Rep } from "@/lib/types"

export default function DashboardPage() {
  const kpis = getKPIs()
  
  // Filter to show only main reps (base reps)
  const baseReps = dummyReps.filter((rep) => rep.role === "main")

  const vansColumns: Column<Van>[] = [
    {
      header: "Van Code",
      accessor: "vanCode",
    },
    {
      header: "Registration",
      accessor: "registrationNumber",
    },
    {
      header: "Main Rep",
      accessor: (row) => row.mainRepName || "Unassigned",
    },
    {
      header: "Branch",
      accessor: "branch",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Last Sync",
      accessor: (row) =>
        row.lastSync ? format(row.lastSync, "MMM dd, yyyy HH:mm") : "Never",
    },
  ]

  const repsColumns: Column<Rep>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Assigned Van",
      accessor: (row) => row.assignedVanCode || "Unassigned",
    },
    {
      header: "Branch",
      accessor: "branch",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Shift",
      accessor: (row) => row.shiftTiming || "-",
    },
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
        {/* KPI Cards */}
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
        </div>

        {/* Distribution Charts - Single Row */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold">Distribution Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VansDistributionChart vans={dummyVans} />
            <RepsDistributionChart reps={baseReps} />
          </div>
        </div>

        {/* Base Vans Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Base Vans</h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable data={dummyVans} columns={vansColumns} />
          </div>
        </div>

        {/* Base Reps Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Base Representatives</h2>
          </div>
          <div className="overflow-x-auto">
            <DataTable data={baseReps} columns={repsColumns} />
          </div>
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

