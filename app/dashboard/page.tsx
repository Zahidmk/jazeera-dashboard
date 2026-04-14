"use client"

import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { DashboardCard } from "@/components/DashboardCard"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Truck, Users, RefreshCw, Plus, UserPlus, TrendingUp, Banknote, Wallet } from "lucide-react"
import { VansDistributionChart } from "@/components/Charts/VansDistributionChart"
import { RepsDistributionChart } from "@/components/Charts/RepsDistributionChart"
import { TopPerformingVansChart } from "@/components/Charts/TopPerformingVansChart"
import { SyncSuccessRateChart } from "@/components/Charts/SyncSuccessRateChart"
import {
  getKPIs,
  getSalesKPIs,
  getDeliveryKPIs,
  getLeadKPIs,
  dummyVans,
  dummyReps,
  dummySyncLogs,
} from "@/lib/dummy-data"

export default function DashboardPage() {
  const router = useRouter()
  const kpis = getKPIs()
  const salesKPIs = getSalesKPIs()
  const deliveryKPIs = getDeliveryKPIs()
  const leadKPIs = getLeadKPIs()

  // Filter to show only main reps (base reps)
  const baseReps = dummyReps.filter((rep) => rep.role === "main")



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
              value={`SAR ${salesKPIs.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<TrendingUp className="h-5 w-5" />}
              variant="blue"
              trend={{ value: 12, isPositive: true }}
              featured={true}
            />
            <DashboardCard
              title="Today's Sales"
              value={`SAR ${salesKPIs.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<Banknote className="h-5 w-5" />}
              variant="blue"
              trend={{ value: 8, isPositive: true }}
            />
            <DashboardCard
              title="Weekly Collection"
              value={`SAR ${salesKPIs.weekSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<Wallet className="h-5 w-5" />}
              variant="blue"
              trend={{ value: 15, isPositive: true }}
            />
            <DashboardCard
              title="Van Deliveries"
              value={`${deliveryKPIs.completed} / ${deliveryKPIs.completed + deliveryKPIs.pending}`}
              icon={<Truck className="h-5 w-5" />}
              variant="green"
              trend={{ value: 5, isPositive: true }}
            />
          </div>
        </div>

        {/* Team & Leads Section */}
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
              value={kpis.activeVans}
              icon={<Truck className="h-5 w-5" />}
              variant="blue"
            />
            <DashboardCard
              title="Van Drivers"
              value={kpis.activeReps}
              icon={<Users className="h-5 w-5" />}
              variant="blue"
            />
            <DashboardCard
              title="New Leads (Today)"
              value={leadKPIs.todayLeads}
              icon={<UserPlus className="h-5 w-5" />}
              variant="blue"
            />
            <DashboardCard
              title="Pending Approval"
              value={leadKPIs.pendingApproval}
              icon={<UserPlus className="h-5 w-5" />}
              variant="orange"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-5">
          {/* Distribution Charts */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Distribution Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VansDistributionChart vans={dummyVans} />
              <RepsDistributionChart reps={baseReps} />
            </div>
          </div>

          {/* Performance & Analytics Charts */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Performance & Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopPerformingVansChart vans={dummyVans} />
              <SyncSuccessRateChart syncLogs={dummySyncLogs} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

