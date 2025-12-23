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
import { dummyVanStock, dummyVans, dummyProducts, dummyStockHistory } from "@/lib/dummy-data"
import { VanStock, StockHistory } from "@/lib/types"
import { format } from "date-fns"
import { Plus, Package, AlertTriangle } from "lucide-react"

export default function StockPage() {
  const [stock, setStock] = useState(dummyVanStock)
  const [history, setHistory] = useState(dummyStockHistory)
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [loadStockModalOpen, setLoadStockModalOpen] = useState(false)
  const [adjustStockModalOpen, setAdjustStockModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedVan, setSelectedVan] = useState<string>("")
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
              setAdjustStockModalOpen(true)
            }}
          >
            Adjust
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStock(row)
              setHistoryModalOpen(true)
            }}
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
        actions={
          <Button size="sm" onClick={() => {
            setLoadStockModalOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Load Stock
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
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

      {/* Load Stock Modal */}
      <Dialog open={loadStockModalOpen} onOpenChange={setLoadStockModalOpen}>
        <DialogContent onClose={() => setLoadStockModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Load Stock</DialogTitle>
            <DialogDescription>
              Add products to van stock
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Van</label>
              <Select
                value={selectedVan}
                onChange={(e) => setSelectedVan(e.target.value)}
                className="mt-1"
              >
                <option value="">Select van</option>
                {dummyVans.map((van) => (
                  <option key={van.id} value={van.id}>
                    {van.vanCode} - {van.registrationNumber}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Select Product</label>
              <Select className="mt-1">
                <option value="">Select product</option>
                {dummyProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadStockModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setLoadStockModalOpen(false)}>Load Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Modal */}
      <Dialog open={adjustStockModalOpen} onOpenChange={setAdjustStockModalOpen}>
        <DialogContent onClose={() => setAdjustStockModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust stock quantity for {selectedStock?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Quantity</label>
              <Input
                value={selectedStock?.quantity || ""}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adjustment Type</label>
              <Select className="mt-1">
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="damage">Record Damage</option>
                <option value="return">Record Return</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Optional notes"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustStockModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAdjustStockModalOpen(false)}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










