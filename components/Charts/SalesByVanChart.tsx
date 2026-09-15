"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesByVanChartProps {
  data: { name: string; sales: number }[]
}

export function SalesByVanChart({ data }: SalesByVanChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Van</CardTitle>
        <CardDescription>Total cash sale revenue per van</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
