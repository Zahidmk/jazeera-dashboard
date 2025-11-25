"use client"

import { Topbar } from "@/components/Topbar"
import { DashboardCard } from "@/components/DashboardCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { dummySystemHealth } from "@/lib/dummy-data"
import { format } from "date-fns"
import { Server, Cpu, HardDrive, Activity, Clock, Zap } from "lucide-react"

export default function SystemHealthPage() {
  const latestHealth = dummySystemHealth[dummySystemHealth.length - 1]

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) {
      return `${days}d ${hours % 24}h`
    }
    return `${hours}h`
  }

  const chartData = dummySystemHealth.map((health) => ({
    time: format(health.timestamp, "HH:mm"),
    cpu: health.cpuUsage,
    memory: health.memoryUsage,
    latency: health.apiLatency,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="System Health" />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          <DashboardCard
            title="Server Uptime"
            value={formatUptime(latestHealth.serverUptime)}
            icon={<Server className="h-5 w-5" />}
          />
          <DashboardCard
            title="Job Workers"
            value={latestHealth.jobWorkersActive}
            icon={<Activity className="h-5 w-5" />}
          />
          <DashboardCard
            title="Queue Size"
            value={latestHealth.queueSize}
            icon={<Clock className="h-5 w-5" />}
          />
          <DashboardCard
            title="CPU Usage"
            value={`${latestHealth.cpuUsage.toFixed(1)}%`}
            icon={<Cpu className="h-5 w-5" />}
          />
          <DashboardCard
            title="Memory Usage"
            value={`${latestHealth.memoryUsage.toFixed(1)}%`}
            icon={<HardDrive className="h-5 w-5" />}
          />
          <DashboardCard
            title="API Latency"
            value={`${latestHealth.apiLatency}ms`}
            icon={<Zap className="h-5 w-5" />}
          />
        </div>

        {/* System Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>CPU, Memory, and API Latency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] sm:h-[350px] lg:h-[400px]">
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
                    yAxisId="left" 
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "latency") return [`${value}ms`, "API Latency"]
                      return [`${value.toFixed(1)}%`, name === "cpu" ? "CPU" : "Memory"]
                    }}
                    labelStyle={{ color: "#000" }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cpu"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="CPU Usage (%)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="memory"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    name="Memory Usage (%)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="latency"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    name="API Latency (ms)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

