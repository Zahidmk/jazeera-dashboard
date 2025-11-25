"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dummySyncLogs, dummyQueueItems, dummyVans, dummyReps } from "@/lib/dummy-data"
import { SyncLog, QueueItem } from "@/lib/types"
import { format } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function SyncPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const filteredLogs = dummySyncLogs.filter((log) => {
    if (statusFilter !== "all" && log.status !== statusFilter) return false
    if (repFilter !== "all" && log.repId !== repFilter) return false
    if (vanFilter !== "all" && log.vanId !== vanFilter) return false
    return true
  })

  const filteredQueue = dummyQueueItems.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false
    return true
  })

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const queueColumns: Column<QueueItem>[] = [
    {
      header: "Queue ID",
      accessor: "id",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Payload Size",
      accessor: (row) => `${(row.payloadSize / 1024).toFixed(2)} KB`,
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Created At",
      accessor: (row) => format(row.createdAt, "MMM dd, yyyy HH:mm"),
    },
  ]

  const logsColumns: Column<SyncLog>[] = [
    {
      header: "",
      accessor: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleRow(row.id)}
        >
          {expandedRows.has(row.id) ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      ),
      className: "w-12",
    },
    {
      header: "Log ID",
      accessor: "id",
    },
    {
      header: "Rep",
      accessor: "repName",
    },
    {
      header: "Van",
      accessor: "vanCode",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Duration",
      accessor: (row) => (row.duration ? `${row.duration}ms` : "-"),
    },
    {
      header: "Timestamp",
      accessor: (row) => format(row.timestamp, "MMM dd, yyyy HH:mm"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Sync Queue & Logs" />
      <div className="p-4 lg:p-6 space-y-6">
        <Tabs defaultValue="queue" className="w-full">
          <TabsList>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <div className="flex gap-4 items-center">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </Select>
            </div>
            <DataTable data={filteredQueue} columns={queueColumns} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </Select>
              <Select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
              >
                <option value="all">All Reps</option>
                {dummyReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </Select>
              <Select
                value={vanFilter}
                onChange={(e) => setVanFilter(e.target.value)}
              >
                <option value="all">All Vans</option>
                {dummyVans.map((van) => (
                  <option key={van.id} value={van.id}>
                    {van.vanCode}
                  </option>
                ))}
              </Select>
              <Input
                type="date"
                placeholder="Date range"
                className="max-w-xs"
              />
            </div>
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg">
                  <DataTable
                    data={[log]}
                    columns={logsColumns}
                    className="border-0"
                  />
                  {expandedRows.has(log.id) && log.errorMessage && (
                    <div className="p-4 bg-muted border-t">
                      <p className="text-sm font-medium text-destructive">
                        Error Message:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

