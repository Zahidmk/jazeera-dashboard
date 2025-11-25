"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyAPIEndpoints } from "@/lib/dummy-data"
import { APIEndpoint } from "@/lib/types"
import { Play, CheckCircle2, XCircle } from "lucide-react"

export default function APIEndpointsPage() {
  const [tryModalOpen, setTryModalOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [testInput, setTestInput] = useState("")
  const [testResponse, setTestResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTryEndpoint = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setTestResponse(
        JSON.stringify(
          {
            status: "success",
            data: { message: "Endpoint test successful", timestamp: new Date().toISOString() },
          },
          null,
          2
        )
      )
      setIsLoading(false)
    }, 1000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return ""
      case "POST":
        return ""
      case "PUT":
        return "bg-yellow-500"
      case "DELETE":
        return "bg-red-500"
      case "PATCH":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const columns: Column<APIEndpoint>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Method",
      accessor: (row) => (
        <Badge 
          className={`${getMethodColor(row.method)} text-white`}
          style={(row.method === "GET" || row.method === "POST") ? { backgroundColor: '#4F46E5' } : undefined}
        >
          {row.method}
        </Badge>
      ),
    },
    {
      header: "URL",
      accessor: "url",
      className: "font-mono text-sm",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedEndpoint(row)
            setTryModalOpen(true)
            setTestResponse(null)
            setTestInput("")
          }}
        >
          <Play className="h-4 w-4 mr-2" />
          Try
        </Button>
      ),
    },
  ]

  const activeEndpoints = dummyAPIEndpoints.filter((e) => e.status === "active").length
  const inactiveEndpoints = dummyAPIEndpoints.filter((e) => e.status === "inactive").length

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="API Endpoints" />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Health Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: '#4F46E5' }} />
                <span className="font-medium">All Systems Operational</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEndpoints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inactive Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveEndpoints}</div>
            </CardContent>
          </Card>
        </div>

        {/* API List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">API Endpoints</h2>
          <DataTable data={dummyAPIEndpoints} columns={columns} />
        </div>
      </div>

      {/* Try Endpoint Modal */}
      <Dialog open={tryModalOpen} onOpenChange={setTryModalOpen}>
        <DialogContent onClose={() => setTryModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Try Endpoint: {selectedEndpoint?.name}</DialogTitle>
            <DialogDescription>
              {selectedEndpoint?.method} {selectedEndpoint?.url}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Request Body (JSON)</label>
              <textarea
                className="w-full h-32 mt-1 p-3 border rounded-md font-mono text-sm"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder='{"key": "value"}'
              />
            </div>
            <div>
              <label className="text-sm font-medium">Response</label>
              <div className="mt-1 p-3 border rounded-md bg-muted min-h-[200px]">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : testResponse ? (
                  <pre className="text-xs font-mono overflow-auto">
                    {testResponse}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click "Send Request" to test the endpoint
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTryModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTryEndpoint} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

