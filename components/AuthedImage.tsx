"use client"

import { useEffect, useState } from "react"
import { BASE_URL, getToken } from "@/lib/api/client"

/**
 * Shows an image that is only available to logged-in users (e.g. attendance selfies).
 * A plain <img src> cannot send the Authorization header, so the file is fetched with the JWT
 * and displayed from a temporary object URL.
 */
export function AuthedImage({ path, alt, className }: { path: string; alt: string; className?: string }) {
  const [state, setState] = useState<{ path: string; url: string | null }>({ path: "", url: null })

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${getToken()}`, "ngrok-skip-browser-warning": "true" }, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        objectUrl = URL.createObjectURL(await res.blob())
        if (!cancelled) setState({ path, url: objectUrl })
      })
      .catch(() => { if (!cancelled) setState({ path, url: null }) })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path])

  if (state.path !== path) {
    return <div className={`${className ?? ""} flex items-center justify-center bg-slate-100 text-xs text-slate-400`}>Loading…</div>
  }
  if (!state.url) {
    return <div className={`${className ?? ""} flex items-center justify-center bg-slate-100 text-xs text-slate-400`}>No image</div>
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={state.url} alt={alt} className={className} />
}
