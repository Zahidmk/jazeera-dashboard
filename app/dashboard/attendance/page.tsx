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
  AttendanceRow, DeviceRow, PageMeta, UserBrief,
  fmtDateTime, fmtDuration, mapsLink, todayRiyadh,
} from "@/lib/api/merchandiser"
import { Loader2, MapPin, Flag, Eye, Smartphone, CheckCircle2, XCircle, Users, LogIn, LogOut } from "lucide-react"

interface Overview extends UserBrief { isCheckedIn: boolean; inVisit: boolean; pendingDevices: number }
interface List<T> { success: boolean; data: T[]; meta?: PageMeta }

export default function AttendancePage() {
  const [tab, setTab] = useState<"attendance" | "devices">("attendance")
  const [date, setDate] = useState(todayRiyadh())
  const [merchandiserId, setMerchandiserId] = useState("")
  const [status, setStatus] = useState("")
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [meta, setMeta] = useState<PageMeta | null>(null)
  const [devices, setDevices] = useState<DeviceRow[]>([])
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
      if (flaggedOnly) qs.set("flagged", "true")
      const [att, dev, ppl] = await Promise.all([
        apiCall<List<AttendanceRow>>(`/api/v1/admin/attendance?${qs}`),
        apiCall<List<DeviceRow>>("/api/v1/admin/devices"),
        apiCall<List<Overview>>("/api/v1/admin/merchandisers"),
      ])
      setRows(att.data)
      setMeta(att.meta ?? null)
      setDevices(dev.data)
      setPeople(ppl.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [date, merchandiserId, status, flaggedOnly, page])

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

  const setDevice = async (d: DeviceRow, isApproved: boolean) => {
    setError("")
    try {
      await apiCall(`/api/v1/admin/devices/${d.id}`, { method: "PATCH", body: JSON.stringify({ isApproved }) })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed")
    }
  }

  const pendingDevices = devices.filter((d) => !d.isApproved).length
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
    { header: "Flags", accessor: (r) => (r.flagged ? <Badge variant="destructive"><Flag className="h-3 w-3 mr-1" />Flagged</Badge> : <span className="text-slate-400">—</span>) },
    {
      header: "",
      accessor: (r) => (
        <Button variant="ghost" size="sm" onClick={() => open(r)} className="cursor-pointer" title="View details"><Eye className="h-4 w-4" /></Button>
      ),
    },
  ]

  const deviceColumns: Column<DeviceRow>[] = [
    { header: "Merchandiser", accessor: (d) => <span className="font-medium">{d.user.name}</span> },
    { header: "Device", accessor: (d) => d.label || "—" },
    { header: "Device ID", accessor: (d) => <code className="text-xs">{d.deviceId}</code> },
    { header: "First seen", accessor: (d) => fmtDateTime(d.firstSeenAt) },
    { header: "Last seen", accessor: (d) => fmtDateTime(d.lastSeenAt) },
    { header: "Status", accessor: (d) => (d.isApproved ? <Badge variant="success">Approved</Badge> : <Badge variant="warning">Awaiting approval</Badge>) },
    {
      header: "Actions",
      accessor: (d) => d.isApproved
        ? <Button variant="ghost" size="sm" className="cursor-pointer text-xs text-red-600" onClick={() => setDevice(d, false)}><XCircle className="h-4 w-4 mr-1" />Revoke</Button>
        : <Button variant="ghost" size="sm" className="cursor-pointer text-xs text-green-700" onClick={() => setDevice(d, true)}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Merchandiser Attendance" />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Merchandisers</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{people.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><LogIn className="h-3.5 w-3.5" />On duty now</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{checkedIn}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />Records (this filter)</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{meta?.total ?? 0}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" />Devices to approve</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingDevices}</div></CardContent></Card>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {([["attendance", "Attendance"], ["devices", `Devices${pendingDevices ? ` (${pendingDevices})` : ""}`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px cursor-pointer ${tab === k ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{label}</button>
          ))}
        </div>

        {error && !selected && <p className="text-sm text-red-500">{error}</p>}

        {tab === "attendance" && (
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
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={flaggedOnly} onChange={(e) => { setFlaggedOnly(e.target.checked); setPage(1) }} />Flagged only
              </label>
              <Button variant="outline" size="sm" onClick={() => { setDate(""); setMerchandiserId(""); setStatus(""); setFlaggedOnly(false); setPage(1) }} className="cursor-pointer">All dates</Button>
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
        )}

        {tab === "devices" && (
          <>
            <p className="text-sm text-slate-500">A merchandiser&apos;s first phone is trusted automatically. Any other phone is blocked from check-in/out until approved here.</p>
            {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div> : <DataTable data={devices} columns={deviceColumns} />}
          </>
        )}
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
                  ["Check-out", selected.checkOutSelfieUrl, selected.checkOutAt, selected.checkOutLat, selected.checkOutLng, selected.checkOutDeviceId]] as const).map(([label, url, at, lat, lng, dev]) => (
                  <div key={label} className="space-y-2">
                    <p className="text-sm font-semibold">{label}</p>
                    {url ? <AuthedImage path={url} alt={`${label} selfie`} className="h-56 w-full rounded-lg object-cover border border-slate-200" />
                      : <div className="h-56 w-full rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-400">Not checked out yet</div>}
                    <p className="text-xs text-slate-600">{fmtDateTime(at)}</p>
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
                  <Button variant="outline" disabled={busy} className="cursor-pointer text-red-600" onClick={() => { if (confirm("Close this attendance now? The record will be flagged.")) patchAttendance({ forceCheckOut: true, adminNote: note || undefined }) }}>Force check-out</Button>
                )}
                <Button variant="outline" disabled={busy} className="cursor-pointer" onClick={() => patchAttendance({ flagged: !selected.flagged })}>{selected.flagged ? "Remove flag" : "Flag record"}</Button>
                <Button disabled={busy} className="cursor-pointer" onClick={() => patchAttendance({ adminNote: note })}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save note"}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
