"use client"

// ─── REAL DATA: fetched live from Odoo via the backend ───────────────────────

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchOdooOrders, OdooOrder } from "@/lib/api/odoo"
import { format } from "date-fns"
import { Eye, RefreshCw } from "lucide-react"

const ORDER_STATE_LABELS: Record<string, string> = {
  draft: "Quotation",
  sent: "Quotation Sent",
  sale: "Sales Order",
  done: "Locked",
  cancel: "Cancelled",
}

const ORDER_STATE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  sale: "bg-green-100 text-green-700",
  done: "bg-purple-100 text-purple-700",
  cancel: "bg-red-100 text-red-700",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OdooOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<OdooOrder | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOdooOrders(500)
      setOrders(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = orders.filter((o) => {
    const ms = !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
    const mst = stateFilter === "all" || o.state === stateFilter
    return ms && mst
  })

  const totalRevenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0)

  const columns: Column<OdooOrder>[] = [
    { header: "Order #", accessor: "orderNumber" },
    { header: "Customer", accessor: "customerName" },
    {
      header: "Items",
      accessor: (o) => `${o.items.length} item(s)`,
    },
    {
      header: "Amount",
      accessor: (o) => `SAR ${o.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    },
    {
      header: "Status",
      accessor: (o) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATE_COLORS[o.state] || "bg-gray-100 text-gray-700"}`}>
          {ORDER_STATE_LABELS[o.state] || o.state}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (o) => {
        try { return format(new Date(o.dateOrder), "MMM dd, yyyy") }
        catch { return o.dateOrder }
      },
    },
    {
      header: "Actions",
      accessor: (o) => (
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => { setSelectedOrder(o); setModalOpen(true) }}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Orders (Live from Odoo)"
        actions={
          <Button size="sm" variant="outline" onClick={loadData} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            ❌ {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{loading ? "…" : orders.length.toLocaleString()}</div><p className="text-xs text-slate-500 mt-1">from Odoo</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "…" : `SAR ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</div>
              <p className="text-xs text-slate-500 mt-1">filtered orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Sales Orders</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{loading ? "…" : orders.filter(o => o.state === "sale").length}</div><p className="text-xs text-slate-500 mt-1">confirmed</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Locked/Done</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-600">{loading ? "…" : orders.filter(o => o.state === "done").length}</div><p className="text-xs text-slate-500 mt-1">completed</p></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search order # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Statuses</option>
            {Object.entries(ORDER_STATE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} of ${orders.length} orders`}
          </span>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading live orders from Odoo…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable data={filtered} columns={columns} />
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Customer: {selectedOrder?.customerName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Status:</span> <strong>{ORDER_STATE_LABELS[selectedOrder?.state || ""] || selectedOrder?.state}</strong></div>
              <div><span className="text-slate-500">Date:</span> <strong>{selectedOrder?.dateOrder ? (() => { try { return format(new Date(selectedOrder.dateOrder), "MMM dd, yyyy HH:mm") } catch { return selectedOrder.dateOrder } })() : "—"}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">Total:</span> <strong className="text-lg">SAR {selectedOrder?.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-sm">Order Lines</h4>
              <div className="space-y-2">
                {selectedOrder?.items.map((item, i) => (
                  <div key={i} className="border rounded p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.productName}</span>
                      <span>SAR {item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      {item.qty} × SAR {item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
                {(!selectedOrder?.items || selectedOrder.items.length === 0) && (
                  <p className="text-sm text-slate-400">No line items available.</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="cursor-pointer">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
