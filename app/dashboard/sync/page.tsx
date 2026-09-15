"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api/client"
import { format } from "date-fns"
import { RefreshCw, CheckCircle, XCircle, Loader2, Package, Users, Truck, Layers } from "lucide-react"

interface SyncLogRow {
  id: string
  syncType: string
  source: string
  status: string
  recordsProcessed: number
  message: string | null
  createdAt: string
}

interface QueueCounts {
  waiting: number
  active: number
  completed: number
  failed: number
}

interface QueueStats {
  products: QueueCounts
  customers: QueueCounts
  orders: QueueCounts
  total: QueueCounts
}

type SyncActionState = { syncing: boolean; result: string | null; error: boolean }

function useSyncAction(endpoint: string, onDone: () => void) {
  const [state, setState] = useState<SyncActionState>({ syncing: false, result: null, error: false })
  const trigger = async () => {
    setState({ syncing: true, result: null, error: false })
    try {
      const json = await apiCall<{ success: boolean; data?: any; error?: string }>(endpoint, { method: "POST" })
      const d = json.data
      const msg = d?.total !== undefined
        ? `Done — ${d.created ?? 0} created, ${d.updated ?? d.skipped ?? 0} updated/skipped, ${d.total} total`
        : "Done"
      setState({ syncing: false, result: msg, error: false })
    } catch (e) {
      setState({ syncing: false, result: e instanceof Error ? e.message : String(e), error: true })
    } finally {
      onDone()
    }
  }
  return { ...state, trigger }
}

export default function SyncPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const [odooStatus, setOdooStatus] = useState<{ connected: boolean; version: string; uid: number } | null>(null)
  const [odooChecking, setOdooChecking] = useState(false)

  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [logs, setLogs] = useState<SyncLogRow[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const checkOdoo = async () => {
    setOdooChecking(true)
    try {
      const json = await apiCall<{ success: boolean; data: { odooVersion: string; uid: number } }>("/api/v1/sync/test")
      setOdooStatus({ connected: true, version: json.data.odooVersion, uid: json.data.uid })
    } catch {
      setOdooStatus(null)
    } finally {
      setOdooChecking(false)
    }
  }

  const loadQueueStats = useCallback(async () => {
    try {
      const json = await apiCall<{ success: boolean; data: QueueStats }>("/api/v1/sync/queue-status")
      setQueueStats(json.data)
    } catch {
      setQueueStats(null)
    }
  }, [])

  const loadLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("syncType", typeFilter)
      const json = await apiCall<{ success: boolean; data: SyncLogRow[] }>(`/api/v1/sync/logs?${params.toString()}`)
      setLogs(json.data)
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }, [statusFilter, typeFilter])

  const refreshAll = useCallback(() => {
    loadQueueStats()
    loadLogs()
  }, [loadQueueStats, loadLogs])

  const productSync = useSyncAction("/api/v1/sync/products", refreshAll)
  const customerSync = useSyncAction("/api/v1/sync/customers", refreshAll)
  const orderSync = useSyncAction("/api/v1/sync/orders", refreshAll)
  const allSync = useSyncAction("/api/v1/sync/all", refreshAll)

  useEffect(() => { checkOdoo() }, [])
  useEffect(() => { loadQueueStats() }, [loadQueueStats])
  useEffect(() => { loadLogs() }, [loadLogs])

  const logsColumns: Column<SyncLogRow>[] = [
    { header: "Type", accessor: (row) => <span className="capitalize">{row.syncType}</span> },
    { header: "Source", accessor: (row) => <span className="capitalize text-slate-500">{row.source}</span> },
    { header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
    { header: "Records", accessor: "recordsProcessed" },
    { header: "Message", accessor: (row) => <span className="text-slate-500">{row.message ?? "-"}</span> },
    { header: "Time", accessor: (row) => format(new Date(row.createdAt), "MMM dd, yyyy HH:mm") },
  ]

  const queueRows = queueStats
    ? [
        { name: "Products", ...queueStats.products },
        { name: "Customers", ...queueStats.customers },
        { name: "Orders", ...queueStats.orders },
      ]
    : []

  const queueColumns: Column<{ name: string } & QueueCounts>[] = [
    { header: "Queue", accessor: "name" },
    { header: "Waiting", accessor: "waiting" },
    { header: "Active", accessor: "active" },
    { header: "Completed", accessor: "completed" },
    { header: "Failed", accessor: "failed" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Sync Queue & Logs" />
      <div className="p-4 lg:p-6 space-y-6">

        {/* Odoo connection */}
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

        {/* Trigger sync */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Products", icon: Package, action: productSync },
            { label: "Customers", icon: Users, action: customerSync },
            { label: "Orders", icon: Truck, action: orderSync },
            { label: "All", icon: Layers, action: allSync },
          ].map(({ label, icon: Icon, action }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Icon className="h-4 w-4" /> Sync {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" onClick={action.trigger} disabled={action.syncing} className="w-full cursor-pointer">
                  {action.syncing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing…</> : <><RefreshCw className="h-4 w-4 mr-2" />Sync {label}</>}
                </Button>
                {action.result && (
                  <p className={`text-xs ${action.error ? "text-red-600" : "text-green-600"}`}>{action.result}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Queue status */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700">Queue Status</h2>
          <DataTable data={queueRows} columns={queueColumns} />
          <p className="text-xs text-slate-400">
            {queueStats ? "Live counts from the background job queue." : "Queue stats unavailable."}
            {" "}If background workers are disabled, syncs run immediately and this will always read zero.
          </p>
        </div>

        {/* Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-slate-700">Sync History</h2>
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
              </Select>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="products">Products</option>
                <option value="customers">Customers</option>
                <option value="orders">Orders</option>
                <option value="all">Full Sync</option>
              </Select>
              <Button variant="outline" size="sm" onClick={refreshAll} className="cursor-pointer">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {logsLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading logs...
            </div>
          ) : (
            <DataTable data={logs} columns={logsColumns} />
          )}
        </div>
      </div>
    </div>
  )
}
