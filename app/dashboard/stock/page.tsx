"use client"

// ─── REAL DATA: fetched live from Odoo via the backend ───────────────────────

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchOdooProducts, fetchOdooStock, OdooStockItem } from "@/lib/api/odoo"
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

type StockRow = {
  productId: number
  productName: string
  sku: string
  category: string | null
  unit: string
  priceRetail: number
  totalQty: number
  totalValue: number
  locations: { location: string; qty: number }[]
  imageUrl: string | null
}

export default function StockPage() {
  const [rows, setRows] = useState<StockRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [products, stockQuants] = await Promise.all([
        fetchOdooProducts(1000),
        fetchOdooStock(2000),
      ])

      const stockMap = new Map<number, OdooStockItem>()
      for (const q of stockQuants) stockMap.set(q.productId, q)

      const merged: StockRow[] = products.map((p) => {
        const si = stockMap.get(p.id)
        const qty = si ? si.totalQty : p.qtyAvailable
        return {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          category: p.category,
          unit: p.unit,
          priceRetail: p.priceRetail,
          totalQty: qty,
          totalValue: qty * p.priceRetail,
          locations: si?.locations || [],
          imageUrl: p.imageUrl || si?.imageUrl || null,
        }
      })
      setRows(merged)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/sync/products`, { method: "POST" })
      const json = await res.json()
      setSyncMsg(json.success
        ? `✅ Synced — Created: ${json.data.created}, Updated: ${json.data.updated}`
        : `❌ ${json.error}`)
      await loadData()
    } catch (e: unknown) {
      setSyncMsg(`❌ ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSyncing(false)
    }
  }

  const categories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[]
  const filtered = rows.filter((r) => {
    const ms = !search || r.productName.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase())
    const mc = categoryFilter === "all" || r.category === categoryFilter
    return ms && mc
  })
  const lowStockItems = filtered.filter((r) => r.totalQty < 10 && r.totalQty >= 0)
  const outOfStockItems = filtered.filter((r) => r.totalQty <= 0)
  const totalValue = filtered.reduce((sum, r) => sum + r.totalValue, 0)

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const stockColumns: Column<StockRow>[] = [
    {
      header: "Image",
      accessor: (r) => r.imageUrl ? (
        <img
          src={r.imageUrl}
          alt={r.productName}
          className="h-10 w-10 object-contain rounded-md border border-slate-200 bg-white"
        />
      ) : (
        <div className="h-10 w-10 rounded-md border border-dashed border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400 text-[10px] font-medium">
          No Img
        </div>
      ),
    },
    { header: "Product", accessor: "productName" },
    { header: "SKU", accessor: "sku" },
    { header: "Category", accessor: (r) => r.category || "—" },
    { header: "Unit", accessor: "unit" },
    { header: "Quantity", accessor: (r) => `${r.totalQty.toLocaleString()} ${r.unit}` },
    {
      header: "Status",
      accessor: (r) => {
        if (r.totalQty <= 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Out of Stock</span>
        if (r.totalQty < 10) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Low Stock</span>
        if (r.totalQty > 100) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Well Stocked</span>
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">In Stock</span>
      },
    },
    { header: "Unit Price", accessor: (r) => `SAR ${r.priceRetail.toFixed(2)}` },
    { header: "Total Value", accessor: (r) => `SAR ${r.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    {
      header: "Locations",
      accessor: (r) => r.locations.length > 0
        ? r.locations.map((l) => `${l.location}: ${l.qty}`).join(" | ")
        : "—",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Stock Management (Live from Odoo)"
        actions={
          <Button size="sm" onClick={handleSync} disabled={syncing} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync to DB"}
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {syncMsg && (
          <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-800">
            {syncMsg}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            ❌ {error} — Make sure the backend is running at {API_URL}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "…" : rows.length.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">from Odoo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "…" : `SAR ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </div>
              <p className="text-xs text-slate-500 mt-1">all products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{loading ? "…" : lowStockItems.length}</div>
              <p className="text-xs text-slate-500 mt-1">below 10 units</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{loading ? "…" : outOfStockItems.length}</div>
              <p className="text-xs text-slate-500 mt-1">need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {!loading && lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 text-base">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert — {lowStockItems.length} item(s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 10).map((item) => (
                  <span key={item.productId} className="text-xs bg-orange-100 text-orange-700 rounded px-2 py-1">
                    {item.productName}: <strong>{item.totalQty}</strong> {item.unit}
                  </span>
                ))}
                {lowStockItems.length > 10 && (
                  <span className="text-xs text-orange-500">+{lowStockItems.length - 10} more</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search product or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-slate-500">
            {loading ? "Loading…" : `${filtered.length} of ${rows.length} products`}
          </span>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stock Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin mr-3" />
            Loading live stock data from Odoo…
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <DataTable data={paginatedData} columns={stockColumns} />
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
              <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-xs">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-semibold">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                      <span className="font-semibold">{totalItems}</span> products
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex items-center gap-2" aria-label="Pagination">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium text-slate-700 px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
