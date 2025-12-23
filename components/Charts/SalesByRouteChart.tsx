"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CashSale, Order, Route } from "@/lib/types"
import { dummyCashSales, dummyOrders, dummyRoutes } from "@/lib/dummy-data"

interface SalesByRouteChartProps {
  routes?: Route[]
  cashSales?: CashSale[]
  orders?: Order[]
}

export function SalesByRouteChart({
  routes = dummyRoutes,
  cashSales = dummyCashSales,
  orders = dummyOrders
}: SalesByRouteChartProps) {
  // Calculate sales by route (cash sales + delivered orders)
  const salesByRoute = routes.map((route) => {
    const routeCashSales = cashSales
      .filter((sale) => sale.vanId === route.vanId)
      .reduce((sum, sale) => sum + sale.totalAmount, 0)

    const routeOrderSales = orders
      .filter((order) => order.routeId === route.id && order.status === "delivered")
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const totalSales = routeCashSales + routeOrderSales

    return {
      name: route.name,
      sales: Math.round(totalSales * 100) / 100,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Route</CardTitle>
        <CardDescription>Total sales amount per route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByRoute}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="sales" fill="#1B60E8" name="Sales (SAR)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}










