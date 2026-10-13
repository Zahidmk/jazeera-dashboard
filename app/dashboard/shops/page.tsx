"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import DeliveryMap from "@/components/DeliveryMap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiCall } from "@/lib/api/client"
import { PageMeta, ShopRow, VisitRow, fmtDateTime } from "@/lib/api/merchandiser"
import { Loader2, Search, Edit, MapPin, Store, MapPinOff, List, Map as MapIcon } from "lucide-react"

interface ListRes { success: boolean; data: ShopRow[]; meta?: PageMeta }
interface DetailRes { success: boolean; data: ShopRow & { shopVisits: VisitRow[] } }

const emptyForm = { name: "", phone: "", contactPerson: "", shopType: "", address: "", city: "", district: "", notes: "", latitude: "", longitude: "" }

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopRow[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [search, setSearch] = useState("")
  const [source, setSource] = useState<"merchandiser" | "all">("merchandiser")
  const [view, setView] = useState<"list" | "map">("list")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selected, setSelected] = useState<(ShopRow & { shopVisits: VisitRow[] }) | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const qs = new URLSearchParams({ page: String(page), limit: view === "map" ? "200" : "30", source })
      if (search.trim()) qs.set("q", search.trim())
      if (view === "map") qs.set("hasLocation", "true")
      const res = await apiCall<ListRes>(`/api/v1/admin/shops?${qs}`)
      setShops(res.data)
      setMeta(res.meta ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shops")
    } finally {
      setLoading(false)
    }
  }, [page, search, source, view])

  useEffect(() => {
    const t = setTimeout(load, 250) // debounce typing in the search box
    return () => clearTimeout(t)
  }, [load])

  const openShop = async (s: ShopRow) => {
    setFormError("")
    try {
      const res = await apiCall<DetailRes>(`/api/v1/admin/shops/${s.id}`)
      const d = res.data
      setSelected(d)
      setForm({
        name: d.name, phone: d.phone ?? "", contactPerson: d.contactPerson ?? "", shopType: d.shopType ?? "", address: d.address ?? "",
        city: d.city ?? "", district: d.district ?? "", notes: d.notes ?? "",
        latitude: d.lat != null ? String(d.lat) : "", longitude: d.lng != null ? String(d.lng) : "",
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load shop")
    }
  }

  const save = async () => {
    if (!selected) return
    if (!form.name.trim()) { setFormError("Shop name is required"); return }
    const lat = form.latitude.trim(), lng = form.longitude.trim()
    if ((lat || lng) && (isNaN(Number(lat)) || isNaN(Number(lng)) || !lat || !lng)) { setFormError("Enter both latitude and longitude as numbers"); return }
    setSaving(true)
    setFormError("")
    try {
      const body: Record<string, unknown> = {
        name: form.name, phone: form.phone, contactPerson: form.contactPerson, shopType: form.shopType,
        address: form.address, city: form.city, district: form.district, notes: form.notes,
      }
      if (lat && lng) { body.latitude = Number(lat); body.longitude = Number(lng) }
      await apiCall(`/api/v1/admin/shops/${selected.id}`, { method: "PATCH", body: JSON.stringify(body) })
      setSelected(null)
      load()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save shop")
    } finally {
      setSaving(false)
    }
  }

  const pins = useMemo(
    () => shops.filter((s) => s.lat != null && s.lng != null).map((s) => ({
      id: s.id, lat: s.lat as number, lng: s.lng as number, title: s.name,
      subtitle: [s.address, s.createdBy ? `Added by ${s.createdBy.name}` : null].filter(Boolean).join(" · ") || undefined,
      type: "shop" as const,
    })),
    [shops]
  )

  const columns: Column<ShopRow>[] = [
    { header: "Shop", accessor: (s) => <span className="font-medium">{s.name}</span> },
    { header: "Contact", accessor: (s) => <div className="leading-tight"><div>{s.contactPerson || "—"}</div><div className="text-xs text-slate-400">{s.phone || ""}</div></div> },
    { header: "Type", accessor: (s) => s.shopType || "—" },
    { header: "City", accessor: (s) => [s.district, s.city].filter(Boolean).join(", ") || "—" },
    { header: "Location", accessor: (s) => s.lat != null && s.lng != null
      ? <span className="inline-flex items-center gap-1 text-slate-600"><MapPin className="h-3.5 w-3.5 text-teal-600" />{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</span>
      : <span className="inline-flex items-center gap-1 text-slate-400"><MapPinOff className="h-3.5 w-3.5" />No GPS</span> },
    { header: "Added by", accessor: (s) => s.createdBy?.name ?? <span className="text-slate-400">Odoo</span> },
    { header: "Visits", accessor: (s) => <Badge variant="secondary">{s._count.shopVisits}</Badge> },
    { header: "Added", accessor: (s) => fmtDateTime(s.createdAt) },
    { header: "", accessor: (s) => <Button variant="ghost" size="sm" onClick={() => openShop(s)} className="cursor-pointer" title="View / edit"><Edit className="h-4 w-4" /></Button> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Merchandiser Shops" />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4">
        <Card><CardContent className="p-4 flex items-center gap-4">
          <div className="bg-teal-50 p-3 rounded-xl"><Store className="w-6 h-6 text-teal-600" /></div>
          <div>
            <p className="text-2xl font-bold">{meta?.total ?? 0}</p>
            <p className="text-sm text-gray-500">{source === "merchandiser" ? "Shops registered by merchandisers" : "All shops / customers"}</p>
          </div>
        </CardContent></Card>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search name, phone, address…" className="pl-9 w-64" />
          </div>
          <Select value={source} onChange={(e) => { setSource(e.target.value as "merchandiser" | "all"); setPage(1) }} className="w-56">
            <option value="merchandiser">Registered by merchandisers</option>
            <option value="all">All customers</option>
          </Select>
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <button onClick={() => setView("list")} className={`px-3 py-2 text-sm flex items-center gap-1 cursor-pointer ${view === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}><List className="h-4 w-4" />List</button>
            <button onClick={() => setView("map")} className={`px-3 py-2 text-sm flex items-center gap-1 cursor-pointer ${view === "map" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}><MapIcon className="h-4 w-4" />Map</button>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="cursor-pointer">Refresh</Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
        ) : view === "list" ? (
          <>
            <DataTable data={shops} columns={columns} />
            {meta && meta.total > meta.limit && (
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)} · {meta.total} shops</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= Math.ceil(meta.total / meta.limit)} onClick={() => setPage(page + 1)} className="cursor-pointer">Next</Button>
                </div>
              </div>
            )}
          </>
        ) : pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400"><MapPin className="w-12 h-12 mb-3 opacity-30" /><p>No shops with GPS to show</p></div>
        ) : (
          <>
            <DeliveryMap pins={pins} height="560px" />
            {meta && meta.total > pins.length && <p className="text-xs text-slate-400">Showing the first {pins.length} of {meta.total} shops. Use search to narrow down.</p>}
          </>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent onClose={() => setSelected(null)} className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.createdBy ? `Registered by ${selected.createdBy.name} on ${fmtDateTime(selected.createdAt)}` : "Synced from Odoo"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2 py-2">
                {([["name", "Shop name *"], ["phone", "Phone"], ["contactPerson", "Contact person"], ["shopType", "Shop type"], ["address", "Address"], ["district", "District"], ["city", "City"], ["latitude", "Latitude"], ["longitude", "Longitude"]] as const).map(([k, label]) => (
                  <div key={k}>
                    <label className="text-sm font-medium">{label}</label>
                    <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Recent visits ({selected._count.shopVisits})</p>
                {selected.shopVisits.length === 0 ? <p className="text-sm text-slate-400">No visits yet</p> : (
                  <ul className="text-sm divide-y divide-slate-100 border border-slate-100 rounded-lg">
                    {selected.shopVisits.map((v) => (
                      <li key={v.id} className="flex items-center justify-between px-3 py-2">
                        <span>{fmtDateTime(v.startedAt)} · {v.merchandiser.name}</span>
                        <span className="flex gap-2">{v.outOfRange && <Badge variant="warning">Out of range</Badge>}<Badge variant="secondary">{v._count.feedback} feedback</Badge></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)} className="cursor-pointer">Close</Button>
                <Button onClick={save} disabled={saving} className="cursor-pointer">{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save changes"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
