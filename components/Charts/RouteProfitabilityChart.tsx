"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Route, CashSale, Order } from "@/lib/types"
import { dummyRoutes, dummyCashSales, dummyOrders } from "@/lib/dummy-data"

interface RouteProfitabilityChartProps {
  routes?: Route[]
  cashSales?: CashSale[]
  orders?: Order[]
}

export function RouteProfitabilityChart({
  routes = dummyRoutes,
  cashSales = dummyCashSales,
  orders = dummyOrders
}: RouteProfitabilityChartProps) {
  // Calculate profitability by route
  const profitabilityData = routes.map((route) => {
    const routeCashSales = cashSales
      .filter((sale) => sale.vanId === route.vanId)
      .reduce((sum, sale) => sum + sale.totalAmount, 0)

    const routeOrderSales = orders
      .filter((order) => order.routeId === route.id && order.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const totalSales = routeCashSales + routeOrderSales
    const deliveredOrders = orders.filter((o) => o.routeId === route.id && o.status === "delivered").length
    const totalOrders = orders.filter((o) => o.routeId === route.id).length
    const successRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0

    return {
      name: route.name,
      sales: Math.round(totalSales * 100) / 100,
      orders: totalOrders,
      successRate: Math.round(successRate * 100) / 100,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Profitability</CardTitle>
        <CardDescription>Sales and delivery success rate by route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "successRate") return `${value.toFixed(1)}%`
                  return `SAR ${value.toFixed(2)}`
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="#1B60E8" name="Sales (SAR)" />
              <Bar yAxisId="right" dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}










