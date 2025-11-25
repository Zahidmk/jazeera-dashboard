"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface SyncRateChartProps {
  data: Array<{
    timestamp: Date
    successRate: number
  }>
}

export function SyncRateChart({ data }: SyncRateChartProps) {
  const chartData = data.map((item) => ({
    time: format(item.timestamp, "HH:mm"),
    rate: Math.round(item.successRate),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Success Rate</CardTitle>
        <CardDescription>Success rate over the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px] sm:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Success Rate"]}
                labelStyle={{ color: "#000" }}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

