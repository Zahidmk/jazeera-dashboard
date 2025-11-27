"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SyncLog } from "@/lib/types"
import { format } from "date-fns"

interface SyncSuccessRateChartProps {
  syncLogs: SyncLog[]
}

export function SyncSuccessRateChart({ syncLogs }: SyncSuccessRateChartProps) {
  // Group syncs by hour and calculate success rate
  const hourlyData = syncLogs.reduce((acc, log) => {
    const hour = format(log.timestamp, "HH:00")
    if (!acc[hour]) {
      acc[hour] = { hour, success: 0, total: 0 }
    }
    acc[hour].total++
    if (log.status === "success") {
      acc[hour].success++
    }
    return acc
  }, {} as Record<string, { hour: string; success: number; total: number }>)

  const chartData = Object.values(hourlyData)
    .map((item) => ({
      hour: item.hour,
      successRate: item.total > 0 ? Math.round((item.success / item.total) * 100) : 0,
      total: item.total,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .slice(-12) // Last 12 hours

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sync Success Rate</CardTitle>
          <CardDescription>Success rate of sync operations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] sm:h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No sync data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Success Rate</CardTitle>
        <CardDescription>Success rate of sync operations over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                width={50}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
                labelStyle={{ color: "#000" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#4F46E5" 
                strokeWidth={2}
                name="Success Rate (%)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

