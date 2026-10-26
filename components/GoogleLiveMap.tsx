"use client"

import { useEffect, useRef, useState } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */

export type MapMarkerKind = "merchandiser" | "driver" | "shop" | "lead"

export interface LiveMapMarker {
  id: string
  lat: number
  lng: number
  title: string
  subtitle?: string
  /** Short label shown in the popup, e.g. "In visit" */
  badge?: string
  kind: MapMarkerKind
  /** Position is old: drawn faded */
  stale?: boolean
}

interface GoogleLiveMapProps {
  apiKey: string
  markers: LiveMapMarker[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  height?: string
}

const KIND_STYLE: Record<MapMarkerKind, { color: string; glyph: string; size: number }> = {
  merchandiser: { color: "#2563eb", glyph: "M", size: 30 },
  driver: { color: "#16a34a", glyph: "D", size: 30 },
  shop: { color: "#0d9488", glyph: "S", size: 22 },
  lead: { color: "#f59e0b", glyph: "L", size: 22 },
}

// Riyadh — shown until there is something to fit
const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }

declare global {
  interface Window {
    google?: any
    gm_authFailure?: () => void
    __initGoogleMaps?: () => void
  }
}

let loaderPromise: Promise<void> | null = null

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loaderPromise) return loaderPromise
  loaderPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      resolve()
      return
    }
    window.__initGoogleMaps = () => resolve()
    const script = document.createElement("script")
    script.src =
      "https://maps.googleapis.com/maps/api/js" +
      `?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=__initGoogleMaps`
    script.async = true
    script.onerror = () => {
      loaderPromise = null
      reject(new Error("Could not load Google Maps. Check the network connection."))
    }
    document.head.appendChild(script)
  })
  return loaderPromise
}

function buildMarkerElement(m: LiveMapMarker): HTMLElement {
  const style = KIND_STYLE[m.kind]
  const el = document.createElement("div")
  el.textContent = style.glyph
  el.style.cssText = [
    `width:${style.size}px`,
    `height:${style.size}px`,
    "border-radius:50%",
    `background:${style.color}`,
    "color:#fff",
    "font:700 12px sans-serif",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "border:2px solid #fff",
    "box-shadow:0 1px 4px rgba(0,0,0,.45)",
    "cursor:pointer",
    `opacity:${m.stale ? 0.45 : 1}`,
  ].join(";")
  return el
}

// Popup content is built with DOM text nodes: names and notes come from user input.
function buildInfoContent(m: LiveMapMarker): HTMLElement {
  const root = document.createElement("div")
  root.style.cssText = "min-width:160px;font-family:sans-serif"
  const title = document.createElement("div")
  title.textContent = m.title
  title.style.cssText = "font-weight:600;margin-bottom:4px"
  root.appendChild(title)
  if (m.subtitle) {
    const sub = document.createElement("div")
    sub.textContent = m.subtitle
    sub.style.cssText = "color:#666;font-size:12px;margin-bottom:4px"
    root.appendChild(sub)
  }
  if (m.badge) {
    const badge = document.createElement("span")
    badge.textContent = m.badge
    badge.style.cssText = `font-size:11px;background:${KIND_STYLE[m.kind].color};color:#fff;padding:2px 8px;border-radius:999px`
    root.appendChild(badge)
  }
  return root
}

export default function GoogleLiveMap({ apiKey, markers, selectedId, onSelect, height = "560px" }: GoogleLiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const infoRef = useRef<any>(null)
  const markerObjs = useRef<Map<string, { marker: any; data: LiveMapMarker }>>(new Map())
  const fittedRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Create the map once
  useEffect(() => {
    let cancelled = false
    window.gm_authFailure = () => {
      setError("Google rejected the API key. Check the key, its restrictions and that billing and the Maps JavaScript API are enabled.")
    }
    ;(async () => {
      try {
        await loadGoogleMaps(apiKey)
        const { Map, InfoWindow } = await window.google.maps.importLibrary("maps")
        await window.google.maps.importLibrary("marker")
        if (cancelled || !containerRef.current) return
        mapRef.current = new Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 10,
          // A map ID is required for advanced markers; Google's demo ID works until you create your own.
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID",
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
        })
        infoRef.current = new InfoWindow()
        infoRef.current.addListener("closeclick", () => onSelectRef.current?.(null))
        setReady(true)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load Google Maps")
      }
    })()
    const objs = markerObjs.current
    return () => {
      cancelled = true
      objs.forEach(({ marker }) => (marker.map = null))
      objs.clear()
      mapRef.current = null
      fittedRef.current = false
    }
  }, [apiKey])

  // Sync markers whenever the data changes (without moving the camera, except the first fit)
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const { AdvancedMarkerElement } = window.google.maps.marker
    const objs = markerObjs.current
    const nextIds = new Set(markers.map((m) => m.id))

    objs.forEach(({ marker }, id) => {
      if (!nextIds.has(id)) {
        marker.map = null
        objs.delete(id)
      }
    })

    for (const m of markers) {
      const existing = objs.get(m.id)
      const position = { lat: m.lat, lng: m.lng }
      if (existing) {
        existing.marker.position = position
        existing.marker.content = buildMarkerElement(m)
        existing.data = m
      } else {
        const marker = new AdvancedMarkerElement({
          map: mapRef.current,
          position,
          content: buildMarkerElement(m),
          title: m.title,
          zIndex: m.kind === "shop" || m.kind === "lead" ? 1 : 10,
        })
        const entry = { marker, data: m }
        marker.addListener("click", () => onSelectRef.current?.(entry.data.id))
        objs.set(m.id, entry)
      }
    }

    if (!fittedRef.current && markers.length > 0) {
      fittedRef.current = true
      if (markers.length === 1) {
        mapRef.current.setCenter({ lat: markers[0].lat, lng: markers[0].lng })
        mapRef.current.setZoom(14)
      } else {
        const bounds = new window.google.maps.LatLngBounds()
        markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }))
        mapRef.current.fitBounds(bounds, 60)
      }
    }
  }, [markers, ready])

  // Focus + popup for the selected marker
  useEffect(() => {
    if (!ready || !mapRef.current || !infoRef.current) return
    if (!selectedId) {
      infoRef.current.close()
      return
    }
    const entry = markerObjs.current.get(selectedId)
    if (!entry) {
      infoRef.current.close()
      return
    }
    mapRef.current.panTo(entry.marker.position)
    infoRef.current.setContent(buildInfoContent(entry.data))
    infoRef.current.open({ map: mapRef.current, anchor: entry.marker })
  }, [selectedId, markers, ready])

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700"
      >
        {error}
      </div>
    )
  }

  return <div ref={containerRef} style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }} />
}
