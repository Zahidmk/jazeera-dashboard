"use client"

import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SalesByVanChart } from "@/components/Charts/SalesByVanChart"
import { SalesByRouteChart } from "@/components/Charts/SalesByRouteChart"
import { RouteProfitabilityChart } from "@/components/Charts/RouteProfitabilityChart"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts"
import { dummyCashSales, dummyOrders, dummyVans, dummyReps } from "@/lib/dummy-data"
import { format } from "date-fns"
import { Download, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  // Payment method distribution
  const paymentDistribution = [
    { name: "Cash", value: dummyCashSales.filter(s => s.paymentMethod === "cash").length },
    { name: "Card", value: dummyCashSales.filter(s => s.paymentMethod === "card").length },
    { name: "UPI", value: dummyCashSales.filter(s => s.paymentMethod === "upi").length },
  ]

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6"]

  // Delivery success rate
  const totalDeliveries = dummyOrders.length
  const successfulDeliveries = dummyOrders.filter(o => o.status === "delivered").length
  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0

  // Sales trends (last 7 days)
  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const daySales = dummyCashSales.filter(s =>
      s.createdAt >= date && s.createdAt < nextDay
    ).reduce((sum, s) => sum + s.totalAmount, 0)

    return {
      date: format(date, "MMM dd"),
      sales: Math.round(daySales * 100) / 100,
    }
  })

  // Top performing vans
  const vanPerformance = dummyVans.map(van => {
    const vanSales = dummyCashSales
      .filter(s => s.vanId === van.id)
      .reduce((sum, s) => sum + s.totalAmount, 0)
    return {
      name: van.vanCode,
      sales: Math.round(vanSales * 100) / 100,
    }
  }).sort((a, b) => b.sales - a.sales).slice(0, 5)

  // Top performing drivers
  const driverPerformance = dummyReps.map(rep => {
    const driverSales = dummyCashSales
      .filter(s => s.driverId === rep.id)
      .reduce((sum, s) => sum + s.totalAmount, 0)
    return {
      name: rep.name,
      sales: Math.round(driverSales * 100) / 100,
    }
  }).sort((a, b) => b.sales - a.sales).slice(0, 5)

  const handleExport = () => {
    // Export functionality placeholder
    alert("Export functionality will be implemented with backend integration")
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Reports & Analytics"
        actions={
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {dummyCashSales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Delivery Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dummyOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Cash Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dummyCashSales.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesByVanChart />
          <SalesByRouteChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RouteProfitabilityChart />

          {/* Payment Method Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>Cash vs Card vs UPI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentDistribution.map((entry, index) => (
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
            <CardDescription>Daily sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
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
                  <BarChart data={vanPerformance}>
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
                  <BarChart data={driverPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="sales" fill="#10b981" name="Sales (SAR)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}










