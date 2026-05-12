"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiCall } from "@/lib/api/client"
import {
  Users,
  MapPin,
  MapPinOff,
  RefreshCw,
  Search,
  ExternalLink,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"

type Customer = {
  id: string
  odooId: number | null
  name: string
  phone: string | null
  email: string | null
  address: string | null
  lat: number | null
  lng: number | null
  updatedAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "with" | "without">("all")

  // Inline location edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLat, setEditLat] = useState("")
  const [editLng, setEditLng] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filter === "with") params.set("hasLocation", "true")
      if (filter === "without") params.set("hasLocation", "false")

      const res = await apiCall<{ success: boolean; data: Customer[]; total: number }>(
        `/api/v1/admin/customers?${params.toString()}`
      )
      setCustomers(res.data ?? [])
      setTotal(res.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setEditLat(customer.lat?.toString() ?? "")
    setEditLng(customer.lng?.toString() ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLat("")
    setEditLng("")
  }

  const saveLocation = async (id: string) => {
    setSaving(true)
    try {
      await apiCall(`/api/v1/admin/customers/${id}/location`, {
        method: "PATCH",
        body: JSON.stringify({ lat: parseFloat(editLat), lng: parseFloat(editLng) }),
      })
      cancelEdit()
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to save location")
    } finally {
      setSaving(false)
    }
  }

  const withLocation = customers.filter(c => c.lat && c.lng).length
  const withoutLocation = customers.filter(c => !c.lat || !c.lng).length

  const columns: Column<Customer>[] = [
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          {row.odooId && (
            <p className="text-xs text-muted-foreground">Odoo #{row.odooId}</p>
          )}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (row) => (
        <div>
          <p className="text-sm">{row.phone ?? "—"}</p>
          {row.email && <p className="text-xs text-muted-foreground">{row.email}</p>}
        </div>
      ),
    },
    {
      header: "Address",
      accessor: (row) => (
        <p className="text-sm text-slate-600 max-w-[200px] truncate">{row.address ?? "—"}</p>
      ),
    },
    {
      header: "Location",
      accessor: (row) => {
        if (editingId === row.id) {
          return (
            <div className="flex items-center gap-1">
              <Input
                className="h-7 w-24 text-xs"
                placeholder="Lat"
                value={editLat}
                onChange={(e) => setEditLat(e.target.value)}
              />
              <Input
                className="h-7 w-24 text-xs"
                placeholder="Lng"
                value={editLng}
                onChange={(e) => setEditLng(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-green-600"
                onClick={() => saveLocation(row.id)}
                disabled={saving}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-red-500"
                onClick={cancelEdit}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }

        if (row.lat && row.lng) {
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-green-300 text-green-700 bg-green-50 text-xs gap-1"
              >
                <MapPin className="h-3 w-3" />
                {row.lat.toFixed(4)}, {row.lng.toFixed(4)}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-slate-400 hover:text-blue-600"
                title="Edit location"
                onClick={() => startEdit(row)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <a
                href={`https://www.google.com/maps?q=${row.lat},${row.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-600"
                title="Open in Google Maps"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-red-200 text-red-500 bg-red-50 text-xs gap-1"
            >
              <MapPinOff className="h-3 w-3" />
              No location
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-slate-400 hover:text-blue-600"
              title="Set location"
              onClick={() => startEdit(row)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Customers & Locations"
        actions={
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Header banner */}
        <div className="rounded-xl p-5 border border-blue-200 bg-linear-to-r from-indigo-50 to-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center shadow"
                style={{ background: "linear-gradient(to bottom right,#1B60E8,#1450C9)" }}
              >
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Customer Locations</h1>
                <p className="text-sm text-slate-500">
                  Manage shop locations for delivery navigation. Locations are auto-synced from Odoo.
                </p>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-3">
              <div className="bg-white border border-green-200 rounded-lg px-4 py-2 text-center">
                <p className="text-lg font-bold text-green-700">{withLocation}</p>
                <p className="text-xs text-slate-500">With Location</p>
              </div>
              <div className="bg-white border border-red-200 rounded-lg px-4 py-2 text-center">
                <p className="text-lg font-bold text-red-500">{withoutLocation}</p>
                <p className="text-xs text-slate-500">Missing Location</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-center">
                <p className="text-lg font-bold text-slate-700">{total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "with", "without"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {f === "all" ? "All" : f === "with" ? "✅ Has Location" : "❌ Missing"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No customers found</p>
              </div>
            ) : (
              <DataTable columns={columns} data={customers} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
