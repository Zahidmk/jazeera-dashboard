"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyVanStock, dummyVans, dummyStockHistory } from "@/lib/dummy-data"
import { VanStock, StockHistory } from "@/lib/types"
import { format } from "date-fns"
import { Package, AlertTriangle } from "lucide-react"

export default function StockPage() {
  const [stock, setStock] = useState(dummyVanStock)
  const [history, setHistory] = useState(dummyStockHistory)
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<VanStock | null>(null)

  const filteredStock = stock.filter((s) => {
    if (vanFilter !== "all" && s.vanId !== vanFilter) return false
    return true
  })

  // Low stock alerts
  const lowStockItems = filteredStock.filter((s) => s.quantity < 10)

  const stockColumns: Column<VanStock>[] = [
    {
      header: "Van",
      accessor: "vanCode",
    },
    {
      header: "Driver",
      accessor: (row) => {
        const van = dummyVans.find(v => v.id === row.vanId)
        return van?.mainRepName || "Unassigned"
      },
    },
    {
      header: "Product",
      accessor: "productName",
    },
    {
      header: "SKU",
      accessor: "productSku",
    },
    {
      header: "Quantity",
      accessor: (row) => `${row.quantity} ${row.unit}`,
    },
    {
      header: "Status",
      accessor: (row) => {
        if (row.quantity === 0) {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Out of Stock</span>
        } else if (row.quantity < 10) {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Low Stock</span>
        } else if (row.quantity > 50) {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Overstocked</span>
        } else {
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Optimal</span>
        }
      },
    },
    {
      header: "Unit Price",
      accessor: (row) => `SAR ${row.price.toFixed(2)}`,
    },
    {
      header: "Total Value",
      accessor: (row) => `SAR ${row.totalValue.toFixed(2)}`,
    },
    {
      header: "Last Updated",
      accessor: (row) => format(row.lastUpdated, "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStock(row)
              setHistoryModalOpen(true)
            }}
            className="cursor-pointer"
            title="View stock history"
          >
            History
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Van Stock Management"
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Vans with Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(stock.map(s => s.vanId)).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                out of {dummyVans.length} total vans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Stock Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {stock.reduce((sum, s) => sum + s.totalValue, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                across all vans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {lowStockItems.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stock.reduce((sum, s) => sum + s.quantity, 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                items in stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert
              </CardTitle>
              <CardDescription>
                {lowStockItems.length} product(s) are running low on stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="text-sm">
                    <span className="font-medium">{item.vanCode}</span> - {item.productName}:{" "}
                    <span className="text-orange-600 font-semibold">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select
            value={vanFilter}
            onChange={(e) => setVanFilter(e.target.value)}
          >
            <option value="all">All Vans</option>
            {dummyVans.map((van) => (
              <option key={van.id} value={van.id}>
                {van.vanCode}
              </option>
            ))}
          </Select>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <DataTable data={filteredStock} columns={stockColumns} />
        </div>
      </div>



      {/* Stock History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent onClose={() => setHistoryModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
            <DialogDescription>
              History for {selectedStock?.productName} in {selectedStock?.vanCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {history
              .filter((h) => h.productId === selectedStock?.productId && h.vanId === selectedStock?.vanId)
              .map((entry) => (
                <div key={entry.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium capitalize">{entry.type}</span>
                      <p className="text-sm text-gray-600">
                        {entry.quantityChange > 0 ? "+" : ""}{entry.quantityChange} {selectedStock?.unit}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {format(entry.createdAt, "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {entry.previousQuantity} → {entry.newQuantity} {selectedStock?.unit}
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHistoryModalOpen(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










