"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SyncLog } from "@/lib/types"

interface SyncFailuresChartProps {
  syncLogs: SyncLog[]
}

const COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#64748b"]

export function SyncFailuresChart({ syncLogs }: SyncFailuresChartProps) {
  // Get only failed syncs
  const failedLogs = syncLogs.filter((log) => log.status === "failed")
  
  // Group by error type
  const errorBreakdown = failedLogs.reduce((acc, log) => {
    const errorType = log.errorMessage?.includes("timeout") 
      ? "Connection Timeout"
      : log.errorMessage?.includes("Invalid") || log.errorMessage?.includes("payload")
      ? "Invalid Payload"
      : log.errorMessage?.includes("Network")
      ? "Network Error"
      : "Server Error"
    
    acc[errorType] = (acc[errorType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(errorBreakdown).map(([name, value]) => ({
    name,
    value,
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sync Failures Breakdown</CardTitle>
          <CardDescription>Distribution of sync failure types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[250px] sm:h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No sync failures recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Failures Breakdown</CardTitle>
        <CardDescription>Distribution of sync failure types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

