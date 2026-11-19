"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api/client"
import { PageMeta, ShopRow, UserBrief, fmtDateTime, mapsLink } from "@/lib/api/merchandiser"
import { Loader2, Store, MapPin } from "lucide-react"

interface List<T> { success: boolean; data: T[]; meta?: PageMeta }

const place = (s: ShopRow) =>
  [s.buildingNumber, s.street, s.district, s.city].filter(Boolean).join(", ") || s.address || "—"

export default function MerchandiserShopsPage() {
  const [q, setQ] = useState("")
  const [search, setSearch] = useState("")
  const [createdById, setCreatedById] = useState("")
  const [noLocation, setNoLocation] = useState(false)
  const [page, setPage] = useState(1)

  const [shops, setShops] = useState<ShopRow[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [people, setPeople] = useState<UserBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Debounce the search box so typing doesn't fire a request per key.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(q.trim()); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "30" })
      if (search) qs.set("q", search)
      if (createdById) qs.set("createdById", createdById)
      const res = await apiCall<List<ShopRow>>(`/api/v1/admin/shops?${qs}`)
      setShops(noLocation ? res.data.filter((s) => s.lat == null || s.lng == null) : res.data)
      setMeta(res.meta ?? null)
      if (people.length === 0) {
        const p = await apiCall<List<UserBrief>>("/api/v1/admin/merchandisers")
        setPeople(p.data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shops")
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, createdById, noLocation])

  useEffect(() => { load() }, [load])

  const columns: Column<ShopRow>[] = [
    { header: "Shop", accessor: (s) => <div><span className="font-medium">{s.name}</span>{s.shopType && <div className="text-xs text-slate-500">{s.shopType}</div>}</div> },
    {
      header: "Created by",
      accessor: (s) => s.createdBy
        ? <div><span className="font-medium">{s.createdBy.name}</span>{s.createdBy.phone && <div className="text-xs text-slate-500">{s.createdBy.phone}</div>}</div>
        : <span className="text-slate-400">—</span>,
    },
    { header: "Created", accessor: (s) => fmtDateTime(s.createdAt) },
    { header: "Contact", accessor: (s) => <div>{s.contactPerson ?? "—"}{s.phone && <div className="text-xs text-slate-500">{s.phone}</div>}</div> },
    { header: "Address", accessor: (s) => <span className="block max-w-xs truncate" title={place(s)}>{place(s)}</span> },
    {
      header: "Location",
      accessor: (s) => s.lat != null && s.lng != null
        ? <a href={mapsLink(s.lat, s.lng)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline"><MapPin className="h-3.5 w-3.5" />Map</a>
        : <Badge variant="warning">No location</Badge>,
    },
    { header: "Visits", accessor: (s) => <Badge variant="secondary">{s._count.shopVisits}</Badge> },
    { header: "Odoo", accessor: (s) => s.odooId ? <Badge variant="success">Synced</Badge> : <Badge variant="outline">Not in Odoo</Badge> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Merchandiser Shops" />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Store className="h-3.5 w-3.5" />Shops registered by merchandisers</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{meta?.total ?? 0}</div></CardContent></Card>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, address..." className="w-64" />
          <Select value={createdById} onChange={(e) => { setCreatedById(e.target.value); setPage(1) }} className="w-52">
            <option value="">All merchandisers</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer"><input type="checkbox" checked={noLocation} onChange={(e) => setNoLocation(e.target.checked)} />No location (this page)</label>
          <Button variant="outline" size="sm" onClick={load} className="cursor-pointer">Refresh</Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
          : <DataTable data={shops} columns={columns} />}

        {meta && meta.total > meta.limit && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)} · {meta.total} shops</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(meta.total / meta.limit)} onClick={() => setPage(page + 1)} className="cursor-pointer">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
