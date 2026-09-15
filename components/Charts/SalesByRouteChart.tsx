"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesByRouteChartProps {
  data: { name: string; revenue: number }[]
}

export function SalesByRouteChart({ data }: SalesByRouteChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Route</CardTitle>
        <CardDescription>Delivered order revenue per route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => `SAR ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#1B60E8" name="Revenue (SAR)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
