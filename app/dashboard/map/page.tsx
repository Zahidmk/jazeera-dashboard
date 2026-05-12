"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Topbar } from "@/components/Topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiCall } from "@/lib/api/client"
import { MapPin, Truck, ClipboardList, DollarSign, Loader2, RefreshCw } from "lucide-react"

// Load map only on client (no SSR)
const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { ssr: false })

interface MapPin {
  id: string
  lat: number
  lng: number
  title: string
  subtitle?: string
  status?: string
  type: "delivery" | "lead" | "sale"
}

interface DeliveryItem {
  id: string
  status: string
  customer: { name: string; address?: string; lat?: number; lng?: number }
}

interface LeadItem {
  id: string
  name: string
  address?: string
  lat?: number
  lng?: number
  createdAt: string
}

interface SaleItem {
  id: string
  totalAmount: number
  latitude?: number
  longitude?: number
  customer?: { name: string }
  createdAt: string
}

export default function MapPage() {
  const [pins, setPins] = useState<MapPin[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "delivery" | "lead" | "sale">("all")
  const [counts, setCounts] = useState({ deliveries: 0, leads: 0, sales: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const allPins: MapPin[] = []
      let deliveryCount = 0, leadCount = 0, saleCount = 0

      // Load deliveries
      try {
        const res = await apiCall<{ success: boolean; data: { deliveries?: DeliveryItem[]; data?: DeliveryItem[] } }>("/api/v1/admin/deliveries?limit=200")
        const deliveries: DeliveryItem[] = res.data?.deliveries || (res.data as unknown as DeliveryItem[]) || []
        deliveryCount = deliveries.length
        deliveries.forEach((d) => {
          if (d.customer?.lat && d.customer?.lng) {
            allPins.push({
              id: d.id,
              lat: d.customer.lat,
              lng: d.customer.lng,
              title: d.customer.name,
              subtitle: d.customer.address,
              status: d.status,
              type: "delivery",
            })
          }
        })
      } catch { /* skip */ }

      // Load leads
      try {
        const res = await apiCall<{ success: boolean; data: LeadItem[] }>("/api/v1/admin/leads?limit=200")
        const leads: LeadItem[] = res.data || []
        leadCount = leads.length
        leads.forEach((l) => {
          if (l.lat && l.lng) {
            allPins.push({
              id: l.id,
              lat: l.lat,
              lng: l.lng,
              title: l.name,
              subtitle: l.address,
              type: "lead",
            })
          }
        })
      } catch { /* skip */ }

      // Load cash sales
      try {
        const res = await apiCall<{ success: boolean; data: SaleItem[] }>("/api/v1/admin/cash-sales?limit=200")
        const sales: SaleItem[] = res.data || []
        saleCount = sales.length
        sales.forEach((s) => {
          if (s.latitude && s.longitude) {
            allPins.push({
              id: s.id,
              lat: s.latitude,
              lng: s.longitude,
              title: s.customer?.name || "Walk-in",
              subtitle: `SAR ${s.totalAmount}`,
              type: "sale",
            })
          }
        })
      } catch { /* skip */ }

      setCounts({ deliveries: deliveryCount, leads: leadCount, sales: saleCount })
      setPins(allPins)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredPins = filter === "all" ? pins : pins.filter((p) => p.type === filter)

  const stats = [
    {
      label: "Deliveries on Map",
      value: pins.filter((p) => p.type === "delivery").length,
      total: counts.deliveries,
      icon: Truck,
      color: "text-blue-500",
      bg: "bg-blue-50",
      key: "delivery" as const,
    },
    {
      label: "Leads on Map",
      value: pins.filter((p) => p.type === "lead").length,
      total: counts.leads,
      icon: ClipboardList,
      color: "text-amber-500",
      bg: "bg-amber-50",
      key: "lead" as const,
    },
    {
      label: "Sales on Map",
      value: pins.filter((p) => p.type === "sale").length,
      total: counts.sales,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50",
      key: "sale" as const,
    },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar title="Live Map" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card
              key={s.key}
              className={`cursor-pointer border-2 transition-all ${filter === s.key ? "border-blue-500 shadow-md" : "border-transparent"}`}
              onClick={() => setFilter(filter === s.key ? "all" : s.key)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`${s.bg} p-3 rounded-xl`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  {s.total !== s.value && (
                    <p className="text-xs text-gray-400">{s.total - s.value} without GPS</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-blue-500" />
              {filter === "all" ? "All Pins" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Pins`}
              <span className="ml-1 text-sm font-normal text-gray-400">({filteredPins.length} shown)</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 mr-2">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Delivery</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Lead</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Sale</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-2 px-4">
            {loading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading map...
              </div>
            ) : filteredPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
                <MapPin className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-lg font-medium">No GPS data available</p>
                <p className="text-sm mt-1">Pins appear when Flutter app sends latitude & longitude</p>
              </div>
            ) : (
              <DeliveryMap pins={filteredPins} height="500px" />
            )}
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <strong>📍 How pins appear:</strong> The Flutter app sends GPS coordinates when drivers submit a sale, add a lead, or when customers have a saved location. Click any pin on the map for details.
        </div>
      </div>
    </div>
  )
}
