"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface SyncAttemptsChartProps {
  data: Array<{
    timestamp: Date
    attempts: number
  }>
}

export function SyncAttemptsChart({ data }: SyncAttemptsChartProps) {
  const chartData = data.map((item) => ({
    hour: format(item.timestamp, "HH:00"),
    attempts: item.attempts,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Attempts per Hour</CardTitle>
        <CardDescription>Number of sync attempts by hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [value, "Attempts"]}
                labelStyle={{ color: "#000" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="attempts" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

