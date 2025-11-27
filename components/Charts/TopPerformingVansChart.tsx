"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Van } from "@/lib/types"

interface TopPerformingVansChartProps {
  vans: Van[]
}

export function TopPerformingVansChart({ vans }: TopPerformingVansChartProps) {
  // Calculate performance based on current load and sync status
  const performanceData = vans
    .filter((van) => van.status === "active")
    .map((van) => ({
      vanCode: van.vanCode,
      performance: van.currentLoad && van.capacity 
        ? Math.round((van.currentLoad / van.capacity) * 100)
        : 0,
      deliveries: Math.floor(Math.random() * 50) + 20, // Mock delivery count
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Vans</CardTitle>
        <CardDescription>Top 5 vans by utilization and deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="vanCode" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "performance") return [`${value}%`, "Utilization"]
                  return [value, "Deliveries"]
                }}
                labelStyle={{ color: "#000" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="performance" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Utilization %" />
              <Bar dataKey="deliveries" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Deliveries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

