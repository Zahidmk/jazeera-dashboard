"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiCall } from "@/lib/api/client"
import { format } from "date-fns"
import {
  ArrowLeft,
  Truck,
  Package,
  TrendingDown,
  TrendingUp,
  Warehouse,
  RefreshCw,
  Calendar,
  User,
  Route,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type InventoryRow = {
  productId: string
  name: string
  sku: string
  unit: string
  category: string | null
  priceRetail: number
  loadedQty: number
  soldQty: number
  damagedQty: number
  remainingQty: number
  revenue: number
}

type ShiftInfo = {
  id: string
  driver: { id: string; name: string }
  route: { id: string; name: string; area: string } | null
  status: string
  startedAt: string
  endedAt: string | null
}

type Summary = {
  totalLoaded: number
  totalSold: number
  totalDamaged: number
  totalRemaining: number
  totalRevenue: number
  deliveries: Record<string, number>
}

type VanInfo = {
  id: string
  plateNumber: string
  model: string | null
  driver: { id: string; name: string; email: string; phone: string } | null
}

type WarehouseData = {
  van: VanInfo
  date: string
  shifts: ShiftInfo[]
  summary: Summary
  inventory: InventoryRow[]
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VanWarehousePage() {
  const params = useParams()
  const router = useRouter()
  const vanId = params.id as string

  const [data, setData] = useState<WarehouseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall<{ success: boolean; data: WarehouseData }>(
        `/api/v1/admin/vans/${vanId}/warehouse?date=${selectedDate}`
      )
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load warehouse data")
    } finally {
      setLoading(false)
    }
  }, [vanId, selectedDate])

  useEffect(() => {
    load()
  }, [load])

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<InventoryRow>[] = [
    {
      header: "Product",
      accessor: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (row) => row.category ?? <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Loaded",
      accessor: (row) => (
        <span className="font-medium text-blue-600">
          {row.loadedQty} {row.unit}
        </span>
      ),
    },
    {
      header: "Sold",
      accessor: (row) => (
        <span className="font-medium text-green-600">
          {row.soldQty} {row.unit}
        </span>
      ),
    },
    {
      header: "Damaged",
      accessor: (row) => (
        <span className="font-medium text-red-600">
          {row.damagedQty} {row.unit}
        </span>
      ),
    },
    {
      header: "Remaining",
      accessor: (row) => {
        const pct = row.loadedQty > 0 ? Math.round((row.remainingQty / row.loadedQty) * 100) : 0
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                pct <= 20 ? "text-red-600" : pct <= 50 ? "text-amber-600" : "text-slate-700"
              }`}
            >
              {row.remainingQty} {row.unit}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                pct <= 20
                  ? "border-red-300 text-red-600"
                  : pct <= 50
                  ? "border-amber-300 text-amber-600"
                  : "border-green-300 text-green-600"
              }`}
            >
              {pct}%
            </Badge>
          </div>
        )
      },
    },
    {
      header: "Revenue",
      accessor: (row) => (
        <span className="font-medium">
          SAR {row.revenue.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Unit Price",
      accessor: (row) => `SAR ${row.priceRetail.toFixed(2)}`,
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Van Warehouse"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/vans/${vanId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Van Details
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Date picker + van header */}
        <div className="bg-linear-to-r from-indigo-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow" style={{ background: "linear-gradient(to bottom right,#1B60E8,#1450C9)" }}>
                <Warehouse className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {data ? data.van.plateNumber : "Loading…"}
                </h1>
                <p className="text-sm text-slate-500">
                  {data?.van.model ?? ""}{" "}
                  {data?.van.driver ? `· Driver: ${data.van.driver.name}` : "· No driver assigned"}
                </p>
              </div>
            </div>
            {/* Date selector */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && data && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                title="Total Loaded"
                value={data.summary.totalLoaded}
                sub="Units loaded at shift start"
                icon={Package}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Sold"
                value={data.summary.totalSold}
                sub="Units sold today"
                icon={TrendingUp}
                color="bg-green-500"
              />
              <StatCard
                title="Total Damaged"
                value={data.summary.totalDamaged ?? 0}
                sub="Units adjusted (damaged) today"
                icon={AlertTriangle}
                color="bg-red-500"
              />
              <StatCard
                title="Remaining Stock"
                value={data.summary.totalRemaining}
                sub="Units still in van"
                icon={TrendingDown}
                color={data.summary.totalRemaining < 50 ? "bg-red-500" : "bg-amber-500"}
              />
              <StatCard
                title="Revenue"
                value={`SAR ${data.summary.totalRevenue.toFixed(2)}`}
                sub="Cash sales today"
                icon={DollarSign}
                color="bg-purple-500"
              />
            </div>

            {/* Delivery summary + shift info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deliveries */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    Deliveries — {format(new Date(selectedDate), "dd MMM yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(data.summary.deliveries).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No deliveries on this day</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(data.summary.deliveries).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 capitalize">{status.toLowerCase().replace("_", " ")}</span>
                          <Badge variant="outline" className="font-semibold">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shifts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Shifts on this day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.shifts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No shifts found for this date</p>
                  ) : (
                    <div className="space-y-3">
                      {data.shifts.map((shift) => (
                        <div key={shift.id} className="border rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              {shift.driver.name}
                            </div>
                            <Badge
                              className={`text-xs ${
                                shift.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                              variant="outline"
                            >
                              {shift.status}
                            </Badge>
                          </div>
                          {shift.route && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Route className="h-3 w-3" />
                              {shift.route.name} — {shift.route.area}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(shift.startedAt), "HH:mm")}
                            {shift.endedAt ? ` → ${format(new Date(shift.endedAt), "HH:mm")}` : " → Active"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Inventory table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-blue-500" />
                  Stock Breakdown — {data.van.plateNumber} — {format(new Date(selectedDate), "dd MMM yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {data.inventory.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No inventory data for this van on {format(new Date(selectedDate), "dd MMM yyyy")}
                  </div>
                ) : (
                  <DataTable columns={columns} data={data.inventory} />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
