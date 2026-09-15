"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SalesByVanChart } from "@/components/Charts/SalesByVanChart"
import { SalesByRouteChart } from "@/components/Charts/SalesByRouteChart"
import { RouteProfitabilityChart } from "@/components/Charts/RouteProfitabilityChart"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { apiCall, BASE_URL, getToken } from "@/lib/api/client"
import { Download, Loader2 } from "lucide-react"

interface StatsResponse {
  vans: { topByRevenue: { plateNumber: string; revenue: number }[] }
  deliveries: { total: number; successRate: number }
  sales: { totalRevenue: number }
}

interface ReportsSummary {
  totalCashSales: number
  saleTypeDistribution: { name: string; value: number }[]
  salesTrend: { date: string; sales: number }[]
  topDrivers: { name: string; revenue: number }[]
  routeStats: { name: string; revenue: number; totalDeliveries: number; successRate: number }[]
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6"]

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [summary, setSummary] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, summaryRes] = await Promise.all([
        apiCall<{ success: boolean; data: StatsResponse }>("/api/v1/admin/stats"),
        apiCall<{ success: boolean; data: ReportsSummary }>("/api/v1/admin/reports/summary"),
      ])
      setStats(statsRes.data)
      setSummary(summaryRes.data)
    } catch {
      // cards/charts fall back to "-" / empty below
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const token = getToken()
      const res = await fetch(`${BASE_URL}/api/v1/admin/reports/export?type=csv&report=sales`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error(`Export failed (${res.status})`)

      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] ?? `sales_report_${new Date().toISOString().split('T')[0]}.csv`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const vanSalesData = stats?.vans.topByRevenue.map((v) => ({ name: v.plateNumber, sales: v.revenue })) ?? []
  const routeSalesData = summary?.routeStats.map((r) => ({ name: r.name, revenue: r.revenue })) ?? []
  const routeProfitabilityData = summary?.routeStats.map((r) => ({ name: r.name, revenue: r.revenue, successRate: r.successRate })) ?? []

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Reports & Analytics"
        actions={
          <Button size="sm" variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Export Report
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading reports...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    SAR {(stats?.sales.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Delivery Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats?.deliveries.successRate ?? 0).toFixed(1)}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.deliveries.total ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Cash Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.totalCashSales ?? 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesByVanChart data={vanSalesData} />
              <SalesByRouteChart data={routeSalesData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RouteProfitabilityChart data={routeProfitabilityData} />

              {/* Sale Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sale Type Distribution</CardTitle>
                  <CardDescription>Cash vs Credit sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary?.saleTypeDistribution ?? []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(summary?.saleTypeDistribution ?? []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends (Last 7 Days)</CardTitle>
                <CardDescription>Daily cash sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary?.salesTrend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#4F46E5" name="Sales (SAR)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Vans</CardTitle>
                  <CardDescription>Sales by van</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vanSalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="sales" fill="#4F46E5" name="Sales (SAR)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Drivers</CardTitle>
                  <CardDescription>Sales by driver</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary?.topDrivers ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Sales (SAR)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
