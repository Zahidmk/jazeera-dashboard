"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RouteProfitabilityChartProps {
  data: { name: string; revenue: number; successRate: number }[]
}

export function RouteProfitabilityChart({ data }: RouteProfitabilityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Profitability</CardTitle>
        <CardDescription>Delivered revenue and delivery success rate by route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              <Bar yAxisId="left" dataKey="revenue" fill="#1B60E8" name="Revenue (SAR)" />
              <Bar yAxisId="right" dataKey="successRate" fill="#10b981" name="Success Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
