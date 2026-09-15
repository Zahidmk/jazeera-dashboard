"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TopPerformingVansChartProps {
  data: { plateNumber: string; revenue: number }[]
}

export function TopPerformingVansChart({ data }: TopPerformingVansChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vans by Revenue</CardTitle>
        <CardDescription>Top 5 vans by cash sale revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plateNumber" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={60} />
              <Tooltip
                formatter={(value: number) => [`SAR ${value.toLocaleString()}`, "Revenue"]}
                labelStyle={{ color: "#000" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="revenue" fill="#1B60E8" radius={[8, 8, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
