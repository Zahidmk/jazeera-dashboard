"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CashSale, Van } from "@/lib/types"
import { dummyCashSales, dummyVans } from "@/lib/dummy-data"

interface SalesByVanChartProps {
  vans?: Van[]
  cashSales?: CashSale[]
}

export function SalesByVanChart({ vans = dummyVans, cashSales = dummyCashSales }: SalesByVanChartProps) {
  // Calculate sales by van
  const salesByVan = vans.map((van) => {
    const vanSales = cashSales
      .filter((sale) => sale.vanId === van.id)
      .reduce((sum, sale) => sum + sale.totalAmount, 0)

    return {
      name: van.vanCode,
      sales: Math.round(vanSales * 100) / 100,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Van</CardTitle>
        <CardDescription>Total sales amount per van</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByVan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
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










