"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { AuthedImage } from "@/components/AuthedImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiCall } from "@/lib/api/client"
import {
  AttendanceRow, PageMeta, UserBrief,
  fmtDateTime, fmtDuration, mapsLink, todayRiyadh,
} from "@/lib/api/merchandiser"
import { Loader2, MapPin, Eye, Users, LogIn, LogOut } from "lucide-react"

interface Overview extends UserBrief { isCheckedIn: boolean; inVisit: boolean }
interface List<T> { success: boolean; data: T[]; meta?: PageMeta }

export default function AttendancePage() {
  const [date, setDate] = useState(todayRiyadh())
  const [merchandiserId, setMerchandiserId] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [people, setPeople] = useState<Overview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selected, setSelected] = useState<AttendanceRow | null>(null)
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const qs = new URLSearchParams({ page: String(page), limit: "30" })
      if (date) qs.set("date", date)
      if (merchandiserId) qs.set("merchandiserId", merchandiserId)
      if (status) qs.set("status", status)
      const [att, ppl] = await Promise.all([
        apiCall<List<AttendanceRow>>(`/api/v1/admin/attendance?${qs}`),
        apiCall<List<Overview>>("/api/v1/admin/merchandisers"),
      ])
      setRows(att.data)
      setMeta(att.meta ?? null)
      setPeople(ppl.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [date, merchandiserId, status, page])

  useEffect(() => { load() }, [load])

  const open = (row: AttendanceRow) => { setSelected(row); setNote(row.adminNote ?? ""); setError("") }

  const patchAttendance = async (body: Record<string, unknown>) => {
    if (!selected) return
    setBusy(true)
    setError("")
    try {
      const res = await apiCall<{ data: AttendanceRow }>(`/api/v1/admin/attendance/${selected.id}`, { method: "PATCH", body: JSON.stringify(body) })
      setSelected(res.data)
      setNote(res.data.adminNote ?? "")
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setBusy(false)
    }
  }

  const checkedIn = people.filter((p) => p.isCheckedIn).length

  const columns: Column<AttendanceRow>[] = [
    { header: "Merchandiser", accessor: (r) => <span className="font-medium">{r.merchandiser.name}</span> },
    { header: "Check-in", accessor: (r) => fmtDateTime(r.checkInAt) },
    { header: "Check-out", accessor: (r) => (r.isOpen ? <Badge variant="warning">On duty</Badge> : fmtDateTime(r.checkOutAt)) },
    { header: "Duration", accessor: (r) => fmtDuration(r.durationMinutes) },
    {
      header: "Location",
      accessor: (r) => (
        <a href={mapsLink(r.checkInLat, r.checkInLng)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
          <MapPin className="h-3.5 w-3.5" />{r.checkInLat.toFixed(4)}, {r.checkInLng.toFixed(4)}
        </a>
      ),
    },
    {
      header: "",
      accessor: (r) => (
        <Button variant="ghost" size="sm" onClick={() => open(r)} className="cursor-pointer" title="View details"><Eye className="h-4 w-4" /></Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Merchandiser Attendance" />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Merchandisers</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{people.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><LogIn className="h-3.5 w-3.5" />On duty now</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{checkedIn}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />Records (this filter)</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{meta?.total ?? 0}</div></CardContent></Card>
        </div>

        {error && !selected && <p className="text-sm text-red-500">{error}</p>}

        <>
            <div className="flex gap-3 items-center flex-wrap">
              <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} className="w-44" />
              <Select value={merchandiserId} onChange={(e) => { setMerchandiserId(e.target.value); setPage(1) }} className="w-52">
                <option value="">All merchandisers</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-40">
                <option value="">Any status</option><option value="open">On duty</option><option value="closed">Checked out</option>
              </Select>
              <Button variant="outline" size="sm" onClick={() => { setDate(""); setMerchandiserId(""); setStatus(""); setPage(1) }} className="cursor-pointer">All dates</Button>
              <Button variant="outline" size="sm" onClick={load} className="cursor-pointer">Refresh</Button>
            </div>
            {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> : <DataTable data={rows} columns={columns} />}
            {meta && meta.total > meta.limit && (
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Page {meta.page} of {Math.ceil(meta.total / meta.limit)} · {meta.total} records</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= Math.ceil(meta.total / meta.limit)} onClick={() => setPage(page + 1)} className="cursor-pointer">Next</Button>
                </div>
              </div>
            )}
        </>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent onClose={() => setSelected(null)} className="max-w-[95vw] sm:max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.merchandiser.name} — {fmtDateTime(selected.checkInAt)}</DialogTitle>
                <DialogDescription>
                  {selected.isOpen ? "Currently on duty" : `Worked ${fmtDuration(selected.durationMinutes)}`} · biometric {selected.checkInBiometric ? "confirmed on device" : "not confirmed"}
                  {selected.checkInBiometricMethod ? ` (${selected.checkInBiometricMethod})` : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2 py-2">
                {([["Check-in", selected.checkInSelfieUrl, selected.checkInAt, selected.checkInLat, selected.checkInLng, selected.checkInDeviceId],
                  // Check-out has no selfie: the app only captures a photo at check-in.
                  ["Check-out", null, selected.checkOutAt, selected.checkOutLat, selected.checkOutLng, selected.checkOutDeviceId]] as const).map(([label, url, at, lat, lng, dev]) => (
                  <div key={label} className="space-y-2">
                    <p className="text-sm font-semibold">{label}</p>
                    {label === "Check-in" && (url
                      ? <AuthedImage path={url} alt={`${label} selfie`} className="h-56 w-full rounded-lg object-cover border border-slate-200" />
                      : <div className="h-56 w-full rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-400">No selfie</div>)}
                    {label === "Check-out" && !at && <p className="text-sm text-slate-400">Not checked out yet</p>}
                    {at && <p className="text-xs text-slate-600">{fmtDateTime(at)}</p>}
                    {lat != null && lng != null && <a href={mapsLink(lat, lng)} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{lat.toFixed(5)}, {lng.toFixed(5)}</a>}
                    {dev && <p className="text-xs text-slate-400 break-all">Device {dev}</p>}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium">Admin note</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Add a note for this record" className="mt-1" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <DialogFooter className="gap-2 flex-wrap">
                {selected.isOpen && (
                  <Button variant="outline" disabled={busy} className="cursor-pointer text-red-600" onClick={() => { if (confirm("Close this attendance now?")) patchAttendance({ forceCheckOut: true, adminNote: note || undefined }) }}>Force check-out</Button>
                )}
                <Button disabled={busy} className="cursor-pointer" onClick={() => patchAttendance({ adminNote: note })}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
