"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
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
import { apiCall } from "@/lib/api/client"
import { Plus, Edit, MapPin, Loader2 } from "lucide-react"

interface RouteRecord {
  id: string
  name: string
  area?: string
  description?: string
  isActive: boolean
  createdAt: string
  _count: { deliveries: number; shifts: number }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteRecord[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<RouteRecord | null>(null)
  const [form, setForm] = useState({ name: "", area: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<ApiResponse<RouteRecord[]>>("/api/v1/admin/routes")
      setRoutes(res.data)
    } catch (err) {
      console.error("Failed to load routes:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const openAdd = () => {
    setSelectedRoute(null)
    setForm({ name: "", area: "", description: "" })
    setError("")
    setModalOpen(true)
  }

  const openEdit = (route: RouteRecord) => {
    setSelectedRoute(route)
    setForm({ name: route.name, area: route.area || "", description: route.description || "" })
    setError("")
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) { setError("Route name is required"); return }
    setSaving(true)
    setError("")
    try {
      if (selectedRoute) {
        await apiCall(`/api/v1/admin/routes/${selectedRoute.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: form.name, area: form.area || null, description: form.description || null }),
        })
      } else {
        await apiCall("/api/v1/admin/routes", {
          method: "POST",
          body: JSON.stringify({ name: form.name, area: form.area || null, description: form.description || null }),
        })
      }
      setModalOpen(false)
      loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save route")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (route: RouteRecord) => {
    try {
      await apiCall(`/api/v1/admin/routes/${route.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !route.isActive }),
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const columns: Column<RouteRecord>[] = [
    { header: "Route Name", accessor: "name" },
    { header: "Area", accessor: (row) => row.area || <span className="text-slate-400">—</span> },
    { header: "Description", accessor: (row) => row.description ? <span className="text-sm text-slate-600 max-w-[200px] truncate block">{row.description}</span> : <span className="text-slate-400">—</span> },
    { header: "Deliveries", accessor: (row) => <span className="text-sm">{row._count.deliveries}</span> },
    { header: "Shifts", accessor: (row) => <span className="text-sm">{row._count.shifts}</span> },
    { header: "Status", accessor: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="cursor-pointer" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="cursor-pointer text-xs" onClick={() => toggleStatus(row)}>
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Route Management"
        actions={
          <Button size="sm" onClick={openAdd} className="cursor-pointer">
            <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Create Route</span>
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Routes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{routes.length}</div><p className="text-xs text-slate-500 mt-1">all routes</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Active Routes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{routes.filter(r => r.isActive).length}</div><p className="text-xs text-slate-500 mt-1">currently active</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Deliveries</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{routes.reduce((s, r) => s + r._count.deliveries, 0)}</div><p className="text-xs text-slate-500 mt-1">across all routes</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Shifts</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{routes.reduce((s, r) => s + r._count.shifts, 0)}</div><p className="text-xs text-slate-500 mt-1">completed shifts</p></CardContent></Card>
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline" size="sm" onClick={loadData} className="cursor-pointer">Refresh</Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
        ) : routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <MapPin className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">No routes yet</p>
            <p className="text-sm mt-1">Click "Create Route" to add your first delivery route</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <DataTable data={routes} columns={columns} />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)} className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRoute ? "Edit Route" : "Create Route"}</DialogTitle>
            <DialogDescription>{selectedRoute ? "Update route information" : "Create a new delivery route"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Route Name <span className="text-red-500">*</span></label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dubai South Route" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Area / Zone</label>
              <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Dubai South" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Covers Jebel Ali industrial area" className="mt-1" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={save} disabled={saving} className="cursor-pointer">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
