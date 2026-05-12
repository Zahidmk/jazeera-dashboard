"use client"

import { useEffect, useRef } from "react"

interface MapPin {
  id: string
  lat: number
  lng: number
  title: string
  subtitle?: string
  status?: string
  type: "delivery" | "lead" | "sale"
}

interface DeliveryMapProps {
  pins: MapPin[]
  height?: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  IN_PROGRESS: "#3b82f6",
  DELIVERED: "#22c55e",
  FAILED: "#ef4444",
  RETURNED: "#8b5cf6",
  delivery: "#3b82f6",
  lead: "#f59e0b",
  sale: "#22c55e",
}

export default function DeliveryMap({ pins, height = "500px" }: DeliveryMapProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Dynamically import leaflet only on client
    const initMap = async () => {
      const L = (await import("leaflet")).default
      // Load leaflet CSS via link tag to avoid TS module error
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!containerRef.current) return
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Default center: Dubai
      const defaultCenter: [number, number] = [25.2048, 55.2708]
      const validPins = pins.filter((p) => p.lat && p.lng)
      const center: [number, number] =
        validPins.length > 0
          ? [validPins[0].lat, validPins[0].lng]
          : defaultCenter

      const map = L.map(containerRef.current).setView(center, 11)
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(map)

      validPins.forEach((pin) => {
        const color = STATUS_COLORS[pin.status || pin.type] || "#3b82f6"

        const icon = L.divIcon({
          html: `<div style="
            background:${color};
            width:14px;height:14px;
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 1px 4px rgba(0,0,0,0.4);
          "></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })

        const typeLabel =
          pin.type === "delivery" ? "🚚 Delivery"
          : pin.type === "lead" ? "📋 Lead"
          : "💰 Sale"

        L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:600;margin-bottom:4px">${pin.title}</div>
              ${pin.subtitle ? `<div style="color:#666;font-size:12px;margin-bottom:4px">${pin.subtitle}</div>` : ""}
              <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
                <span style="font-size:11px;background:${color};color:white;padding:2px 8px;border-radius:999px">
                  ${pin.status || typeLabel}
                </span>
              </div>
            </div>
          `)
      })

      // Fit bounds if multiple pins
      if (validPins.length > 1) {
        const bounds = L.latLngBounds(validPins.map((p) => [p.lat, p.lng]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [pins])

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }}
    />
  )
}
