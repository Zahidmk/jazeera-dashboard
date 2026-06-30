"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiCall } from "@/lib/api/client"
import { format } from "date-fns"
import {
  AlertTriangle,
  Calendar,
  Package,
  Search,
  RefreshCw,
  Camera,
  Truck,
  User,
  Clock,
  Eye,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type DamagedItem = {
  adjustmentId: string
  productId: string
  productName: string
  sku: string
  productImage: string | null
  proofImage: string | null
  quantity: number
  vanNumber: string
  driverName: string
  uploadedAt: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

type DamagedStockReport = {
  reportDate: string
  totalDamageProductCount: number
  items: DamagedItem[]
}

export default function DamagedStockPage() {
  const [data, setData] = useState<DamagedStockReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null)

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall<{ success: boolean; data: DamagedStockReport }>(
        `/api/v1/storekeeper/damaged-stock?date=${selectedDate}`
      )
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load damaged stock report")
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    load()
  }, [load])

  const handleResolve = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      await apiCall(`/api/v1/storekeeper/damaged-stock/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ action }),
      })
      load()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to resolve item")
    }
  }

  // ─── Filter List ────────────────────────────────────────────────────────────
  const filteredItems = data?.items.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      item.productName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.driverName.toLowerCase().includes(q) ||
      item.vanNumber.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    )
  }) ?? []

  const totalIncidents = filteredItems.length
  const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0)

  // ─── Table columns ──────────────────────────────────────────────────────────
  const columns: Column<DamagedItem>[] = [
    {
      header: "Product Detail",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            {row.productImage ? (
              <img src={row.productImage} alt={row.productName} className="h-full w-full object-cover" />
            ) : (
              <Package className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{row.productName}</p>
            <p className="text-xs text-slate-500">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Van & Driver",
      accessor: (row) => (
        <div>
          <p className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            {row.vanNumber}
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <User className="h-3.5 w-3.5 text-slate-400" />
            {row.driverName}
          </p>
        </div>
      ),
    },
    {
      header: "Qty",
      accessor: (row) => (
        <Badge variant={row.reason === 'RETURN' ? 'outline' : 'destructive'} className="font-semibold px-2 py-0.5">
          {row.quantity} units
        </Badge>
      ),
    },
    {
      header: "Reason / Notes",
      accessor: (row) => (
        <span className="text-slate-600 font-medium italic block max-w-xs truncate">
          "{row.reason}"
        </span>
      ),
    },
    {
      header: "Reported Time",
      accessor: (row) => (
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {format(new Date(row.uploadedAt), "HH:mm")}
        </span>
      ),
    },
    {
      header: "Proof Photo",
      accessor: (row) => {
        if (!row.proofImage) {
          return <span className="text-slate-400 italic text-xs">No Photo</span>
        }
        return (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50 shrink-0 cursor-pointer"
            onClick={() => setSelectedProofImage(row.proofImage)}
          >
            <Camera className="h-3.5 w-3.5 mr-1" />
            View Photo
          </Button>
        )
      },
    },
    {
      header: "Status / Action",
      accessor: (row) => {
        if (row.status === "PENDING") {
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-green-200 text-green-600 hover:bg-green-50 px-2 cursor-pointer"
                onClick={() => handleResolve(row.adjustmentId, "APPROVE")}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-200 text-red-600 hover:bg-red-50 px-2 cursor-pointer"
                onClick={() => handleResolve(row.adjustmentId, "REJECT")}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </div>
          )
        }
        
        return (
          <Badge 
            variant={row.status === "APPROVED" ? "default" : "secondary"}
            className={row.status === "APPROVED" ? "bg-green-500 hover:bg-green-600" : "bg-slate-300 text-slate-700"}
          >
            {row.status}
          </Badge>
        )
      }
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Topbar
        title="Stock Returns & Damages"
        actions={
          <Button variant="outline" onClick={load} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Banner */}
        <div className="rounded-xl p-5 border border-red-200 bg-linear-to-r from-red-50 to-orange-50 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-red-600 shadow">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Stock Returns & Damages</h1>
                <p className="text-sm text-slate-500">
                  Analyze, review, and audit reported damaged stock and unsold returns across all vans.
                </p>
              </div>
            </div>
            {/* Date filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Damaged Units</p>
                <p className="text-3xl font-extrabold text-red-600 mt-1">{loading ? "..." : totalQuantity}</p>
                <p className="text-xs text-muted-foreground mt-1">Total items damaged on this date</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Damaged Incidents</p>
                <p className="text-3xl font-extrabold text-orange-600 mt-1">{loading ? "..." : totalIncidents}</p>
                <p className="text-xs text-muted-foreground mt-1">Total unique adjustment reports</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Report Date</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {format(new Date(selectedDate), "dd MMM yyyy")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Active report viewing date</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Table Card */}
        <Card className="border-slate-200 shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by product, SKU, driver, van..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 h-10 w-full"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredItems.length} entries
            </div>
          </div>
          <CardContent className="p-0 bg-white">
            {loading ? (
              <div className="p-16 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-sm font-medium">Loading damaged items data...</p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredItems} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lightbox Photo Preview Modal */}
      {selectedProofImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedProofImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[85vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
              <h3 className="text-slate-200 text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-indigo-400" />
                Proof of Damage Image
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                onClick={() => setSelectedProofImage(null)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center p-2 bg-slate-950 overflow-hidden">
              <img 
                src={selectedProofImage} 
                alt="Proof of Damage Photo" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
