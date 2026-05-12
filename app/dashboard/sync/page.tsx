"use client"

import { useState, useEffect } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dummySyncLogs, dummyQueueItems, dummyVans, dummyReps } from "@/lib/dummy-data"
import { SyncLog, QueueItem } from "@/lib/types"
import { format } from "date-fns"
import { ChevronDown, ChevronUp, RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type SyncStatus = { syncing: boolean; result: string | null; error: boolean }

function useSyncAction(endpoint: string) {
  const [state, setState] = useState<SyncStatus>({ syncing: false, result: null, error: false })
  const trigger = async () => {
    setState({ syncing: true, result: null, error: false })
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: "POST" })
      const json = await res.json()
      if (json.success) {
        const d = json.data
        const msg = d.total !== undefined
          ? `✅ Done — ${d.created ?? 0} created, ${d.updated ?? d.skipped ?? 0} updated/skipped, ${d.total} total`
          : `✅ Done`
        setState({ syncing: false, result: msg, error: false })
      } else {
        setState({ syncing: false, result: `❌ ${json.error}`, error: true })
      }
    } catch (e: unknown) {
      setState({ syncing: false, result: `❌ ${e instanceof Error ? e.message : String(e)}`, error: true })
    }
  }
  return { ...state, trigger }
}

export default function SyncPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [odooStatus, setOdooStatus] = useState<{ connected: boolean; version: string; uid: number } | null>(null)
  const [odooChecking, setOdooChecking] = useState(false)

  const productSync = useSyncAction("/api/v1/sync/products")
  const customerSync = useSyncAction("/api/v1/sync/customers")

  const checkOdoo = async () => {
    setOdooChecking(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/sync/test`)
      const json = await res.json()
      if (json.success) setOdooStatus({ connected: true, version: json.data.odooVersion, uid: json.data.uid })
      else setOdooStatus(null)
    } catch { setOdooStatus(null) }
    finally { setOdooChecking(false) }
  }

  useEffect(() => { checkOdoo() }, [])

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

        {/* ── Odoo Live Sync Panel ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Connection Status */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Odoo Connection</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              {odooChecking ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : odooStatus ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div className="text-sm">
                {odooChecking ? "Checking…" : odooStatus ? (
                  <span className="text-green-700 font-medium">Connected — v{odooStatus.version}</span>
                ) : (
                  <span className="text-red-600 font-medium">Not connected</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={checkOdoo} disabled={odooChecking} className="ml-auto cursor-pointer">
                <RefreshCw className={`h-3 w-3 ${odooChecking ? "animate-spin" : ""}`} />
              </Button>
            </CardContent>
          </Card>

          {/* Sync Products */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Sync Products from Odoo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" onClick={productSync.trigger} disabled={productSync.syncing} className="w-full cursor-pointer">
                {productSync.syncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing…</> : <><RefreshCw className="h-4 w-4 mr-2" />Sync Products</>}
              </Button>
              {productSync.result && (
                <p className={`text-xs ${productSync.error ? "text-red-600" : "text-green-600"}`}>{productSync.result}</p>
              )}
            </CardContent>
          </Card>

          {/* Sync Customers */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Sync Customers from Odoo</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" onClick={customerSync.trigger} disabled={customerSync.syncing} className="w-full cursor-pointer">
                {customerSync.syncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing…</> : <><RefreshCw className="h-4 w-4 mr-2" />Sync Customers</>}
              </Button>
              {customerSync.result && (
                <p className={`text-xs ${customerSync.error ? "text-red-600" : "text-green-600"}`}>{customerSync.result}</p>
              )}
            </CardContent>
          </Card>
        </div>

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

