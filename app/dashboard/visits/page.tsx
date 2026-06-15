"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { getVisits } from "@/lib/api/salesman"
import { format } from "date-fns"
import { RefreshCw, Loader2, MapPin } from "lucide-react"

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getVisits()
      setVisits(res.data || [])
    } catch (e) {
      console.error("Failed to fetch visits", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  const columns: Column<any>[] = [
    {
      header: "Visited Time",
      accessor: (row) => format(new Date(row.visitedAt), "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Salesman",
      accessor: (row) => row.salesman?.name || "N/A",
    },
    {
      header: "Customer",
      accessor: (row) => row.customer?.name || "Walk-in Customer",
    },
    {
      header: "GPS Location",
      accessor: (row) => {
        if (row.lat && row.lng) {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${row.lat},${row.lng}`
          return (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline inline-flex"
            >
              <MapPin className="h-4 w-4 text-blue-500" />
              <span>{row.lat.toFixed(4)}, {row.lng.toFixed(4)}</span>
            </a>
          )
        }
        return "—"
      },
    },
    {
      header: "Visit Notes",
      accessor: "notes",
      className: "max-w-xs truncate",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Client Visits History"
        actions={
          <Button size="sm" onClick={fetchVisits} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            Total Logged Visits: <span className="font-semibold text-slate-800">{visits.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-sm text-slate-500">Loading visit logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable data={visits} columns={columns} />
          </div>
        )}
      </div>
    </div>
  )
}
