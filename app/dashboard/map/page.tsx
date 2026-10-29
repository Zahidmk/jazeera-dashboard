"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiCall } from "@/lib/api/client"
import type { LiveMapMarker } from "@/components/GoogleLiveMap"
import { MapPin, Users, Store, ClipboardList, Loader2, RefreshCw, Navigation } from "lucide-react"

// Maps only run in the browser
const GoogleLiveMap = dynamic(() => import("@/components/GoogleLiveMap"), { ssr: false })
const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { ssr: false })

const GOOGLE_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
const REFRESH_MS = 30_000
const STALE_MS = 2 * 60 * 60 * 1000 // a position older than 2h is drawn faded

// ─── Types ────────────────────────────────────────────────────────────────────
type Person = {
  id: string
  name: string
  phone: string | null
  role: "MERCHANDISER" | "DRIVER" | "SALESMAN"
  status: "IN_VISIT" | "ON_DUTY" | "STALE_OPEN" | "CHECKED_OUT" | "NOT_STARTED" | "ON_SHIFT" | "ACTIVE_TODAY" | "NO_ACTIVITY"
  lat: number | null
  lng: number | null
  at: string | null
  source: "CHECK_IN" | "CHECK_OUT" | "VISIT_START" | "VISIT_END" | "SALE" | null
  detail: string | null
}

type Shop = { id: string; name: string; lat: number; lng: number; shopType: string | null; markerColor: string | null; city: string | null }

type LiveMapResponse = {
  success: boolean
  data: { generatedAt: string; people: Person[]; shops: Shop[] }
}

type LeadItem = { id: string; name: string; address?: string; lat?: number; lng?: number }

const STATUS_LABEL: Record<Person["status"], string> = {
  IN_VISIT: "In a visit",
  ON_DUTY: "On duty",
  STALE_OPEN: "Not checked out",
  CHECKED_OUT: "Checked out",
  NOT_STARTED: "Not started",
  ON_SHIFT: "On shift",
  ACTIVE_TODAY: "Active today",
  NO_ACTIVITY: "No activity today",
}

const STATUS_PILL: Record<Person["status"], string> = {
  IN_VISIT: "bg-blue-100 text-blue-700",
  ON_DUTY: "bg-green-100 text-green-700",
  ON_SHIFT: "bg-green-100 text-green-700",
  STALE_OPEN: "bg-red-100 text-red-700",
  ACTIVE_TODAY: "bg-amber-100 text-amber-700",
  CHECKED_OUT: "bg-slate-100 text-slate-600",
  NOT_STARTED: "bg-slate-100 text-slate-500",
  NO_ACTIVITY: "bg-slate-100 text-slate-500",
}

const SOURCE_LABEL: Record<NonNullable<Person["source"]>, string> = {
  CHECK_IN: "Checked in",
  CHECK_OUT: "Checked out",
  VISIT_START: "Started visit",
  VISIT_END: "Ended visit",
  SALE: "Cash sale",
}

// Most useful first: people who are out working
const STATUS_ORDER: Person["status"][] = ["IN_VISIT", "ON_DUTY", "ON_SHIFT", "STALE_OPEN", "ACTIVE_TODAY", "CHECKED_OUT", "NOT_STARTED", "NO_ACTIVITY"]

function timeAgo(iso: string | null, now: number): string {
  if (!iso) return "no position yet"
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  return hours < 24 ? `${hours} h ${mins % 60} min ago` : `${Math.floor(hours / 24)} d ago`
}

export default function MapPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [show, setShow] = useState({ staff: true, shops: true, leads: false })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const loadLive = useCallback(async () => {
    try {
      const res = await apiCall<LiveMapResponse>("/api/v1/admin/live-map")
      setPeople(res.data.people)
      setShops(res.data.shops)
      setLastUpdated(new Date(res.data.generatedAt))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load live map")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadLeads = useCallback(async () => {
    try {
      const res = await apiCall<{ success: boolean; data: LeadItem[] }>("/api/v1/admin/leads?limit=200")
      setLeads(res.data || [])
    } catch {
      /* leads are optional */
    }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadLive(), loadLeads()])
  }, [loadLive, loadLeads])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Poll while the tab is visible; also keeps the "x min ago" labels fresh
  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => {
      setNow(Date.now())
      if (document.visibilityState === "visible") loadLive()
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [autoRefresh, loadLive])

  const sortedPeople = useMemo(
    () =>
      [...people].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || a.name.localeCompare(b.name)
      ),
    [people]
  )

  const markers: LiveMapMarker[] = useMemo(() => {
    const out: LiveMapMarker[] = []
    if (show.staff) {
      for (const p of people) {
        if (p.lat == null || p.lng == null) continue
        const stale = p.at ? now - new Date(p.at).getTime() > STALE_MS : true
        out.push({
          id: `p:${p.id}`,
          lat: p.lat,
          lng: p.lng,
          title: p.name,
          subtitle: [p.detail, p.source ? `${SOURCE_LABEL[p.source]} ${timeAgo(p.at, now)}` : null]
            .filter(Boolean)
            .join(" · "),
          badge: STATUS_LABEL[p.status],
          kind: p.role === "MERCHANDISER" ? "merchandiser" : "driver",
          stale,
        })
      }
    }
    if (show.shops) {
      for (const s of shops) {
        out.push({
          id: `s:${s.id}`,
          lat: s.lat,
          lng: s.lng,
          title: s.name,
          subtitle: [s.shopType, s.city].filter(Boolean).join(" · ") || undefined,
          badge: "Shop",
          kind: "shop",
          color: s.markerColor ?? undefined,
        })
      }
    }
    if (show.leads) {
      for (const l of leads) {
        if (!l.lat || !l.lng) continue
        out.push({ id: `l:${l.id}`, lat: l.lat, lng: l.lng, title: l.name, subtitle: l.address, badge: "Lead", kind: "lead" })
      }
    }
    return out
  }, [people, shops, leads, show, now])

  // Used only when no Google key is configured (OpenStreetMap fallback)
  const fallbackPins = useMemo(
    () =>
      markers.map((m) => ({
        id: m.id,
        lat: m.lat,
        lng: m.lng,
        title: m.title,
        subtitle: m.subtitle,
        status: m.badge,
        type: (m.kind === "shop" ? "shop" : m.kind === "lead" ? "lead" : "staff") as "shop" | "lead" | "staff",
      })),
    [markers]
  )

  const onDuty = people.filter((p) => p.status === "ON_DUTY" || p.status === "IN_VISIT").length
  const inVisit = people.filter((p) => p.status === "IN_VISIT").length
  const onShift = people.filter((p) => p.status === "ON_SHIFT").length

  const stats = [
    { label: "Merchandisers on duty", value: onDuty, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "In a shop visit", value: inVisit, icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Drivers on shift", value: onShift, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Shops on map", value: shops.length, icon: Store, color: "text-teal-600", bg: "bg-teal-50" },
  ]

  const toggles: { key: keyof typeof show; label: string; icon: typeof Users }[] = [
    { key: "staff", label: "Staff", icon: Users },
    { key: "shops", label: "Shops", icon: Store },
    { key: "leads", label: "Leads", icon: ClipboardList },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar title="Live Map" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${s.bg} p-3 rounded-xl`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!GOOGLE_KEY && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Google Maps is not configured.</strong> Showing the OpenStreetMap fallback. Set{" "}
            <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in the dashboard environment and rebuild to switch to Google Maps.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          {/* Map */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-blue-500" />
                Field staff &amp; shops
                <span className="ml-1 text-sm font-normal text-gray-400">({markers.length} shown)</span>
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {toggles.map((t) => (
                  <Button
                    key={t.key}
                    variant={show[t.key] ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShow((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                  >
                    <t.icon className="w-3.5 h-3.5 mr-1" />
                    {t.label}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading} title="Refresh now">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {loading && !lastUpdated ? (
                <div className="flex items-center justify-center h-[560px] text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading map...
                </div>
              ) : GOOGLE_KEY ? (
                <GoogleLiveMap apiKey={GOOGLE_KEY} markers={markers} selectedId={selectedId} onSelect={setSelectedId} height="560px" />
              ) : markers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[560px] text-gray-400">
                  <MapPin className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-lg font-medium">No positions yet today</p>
                  <p className="text-sm mt-1">Pins appear once staff check in, visit shops or make sales.</p>
                </div>
              ) : (
                <DeliveryMap pins={fallbackPins} height="560px" />
              )}

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Merchandiser</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Driver / salesman</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> Shop</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Lead</span>
                  <span>Faded = last position over 2 h old</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                  Auto-refresh every 30 s
                  {lastUpdated && <span className="text-gray-400">· updated {lastUpdated.toLocaleTimeString()}</span>}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* People list */}
          <Card className="xl:max-h-[720px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Team ({people.length})</CardTitle>
              <p className="text-xs text-gray-500">
                Positions are recorded when someone checks in or out, starts or ends a visit, or makes a sale — not continuously.
              </p>
            </CardHeader>
            <CardContent className="overflow-auto px-3 pb-3 space-y-2">
              {sortedPeople.length === 0 && !loading && (
                <p className="text-sm text-gray-400 text-center py-8">No active staff found.</p>
              )}
              {sortedPeople.map((p) => {
                const hasPosition = p.lat != null && p.lng != null
                const selected = selectedId === `p:${p.id}`
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!hasPosition || !show.staff}
                    onClick={() => setSelectedId(selected ? null : `p:${p.id}`)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    } disabled:opacity-60 disabled:cursor-default`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-slate-900 truncate">{p.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_PILL[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.role === "MERCHANDISER" ? "Merchandiser" : p.role === "DRIVER" ? "Driver" : "Salesman"}
                      {p.detail ? ` · ${p.detail}` : ""}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {hasPosition
                        ? `${p.source ? SOURCE_LABEL[p.source] : "Last seen"} ${timeAgo(p.at, now)}`
                        : "No position today"}
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
