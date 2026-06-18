"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { PaymentMethodBadge } from "@/components/PaymentMethodBadge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api/client"
import { CashSale } from "@/lib/types"
import { format } from "date-fns"
import { Eye, Download, Loader2, RefreshCw } from "lucide-react"

export default function CashSalesPage() {
  const [sales, setSales] = useState<CashSale[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [vans, setVans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dateFilter, setDateFilter] = useState<string>("all")
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [driverFilter, setDriverFilter] = useState<string>("all")
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<CashSale | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [salesRes, driversRes, vansRes] = await Promise.all([
        apiCall<{ success: boolean; data: any[] }>("/api/v1/admin/sales?limit=500"),
        apiCall<{ success: boolean; data: any[] }>("/api/v1/admin/drivers"),
        apiCall<{ success: boolean; data: any[] }>("/api/v1/admin/vans"),
      ])

      const fetchedVans = vansRes.data || []
      const fetchedDrivers = driversRes.data || []
      const fetchedSales = salesRes.data || []

      setVans(fetchedVans)
      setDrivers(fetchedDrivers)

      const mappedSales: CashSale[] = fetchedSales.map((sale) => {
        const vanForDriver = fetchedVans.find(
          (v: any) => v.driver?.id === sale.driverId || v.driverId === sale.driverId
        )
        const vanCode = vanForDriver ? vanForDriver.plateNumber : "Van —"
        const vanId = vanForDriver ? vanForDriver.id : ""

        return {
          id: sale.id,
          saleNumber: sale.odooSaleId ? `SO-${sale.odooSaleId}` : `CS-${sale.id.slice(0, 8).toUpperCase()}`,
          vanId,
          vanCode,
          driverId: sale.driverId,
          driverName: sale.driver?.name || "Unknown Driver",
          customerId: sale.customerId || "",
          customerName: sale.customer?.name || "Walk-in Customer",
          customerPhone: sale.customer?.phone || "—",
          totalAmount: sale.totalAmount,
          paymentMethod: sale.saleType === "CREDIT" ? "card" : "cash",
          createdAt: new Date(sale.createdAt),
          receiptUrl: sale.receiptUrl || undefined,
          items: (sale.items || []).map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product?.name || "Unknown Product",
            quantity: item.quantity,
            unit: item.product?.unit || "pcs",
            price: item.unitPrice,
            total: item.unitPrice * item.quantity * (1 - (item.discount || 0) / 100),
          })),
        }
      })

      setSales(mappedSales)
    } catch (err: any) {
      console.error("Failed to load cash sales:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredSales = sales.filter((sale) => {
    if (vanFilter !== "all" && sale.vanId !== vanFilter) return false
    if (driverFilter !== "all" && sale.driverId !== driverFilter) return false

    if (dateFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (sale.createdAt < today) return false
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      if (sale.createdAt < weekAgo) return false
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      if (sale.createdAt < monthAgo) return false
    }

    return true
  })

  // Calculate stats
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const cashSales = filteredSales.filter(s => s.paymentMethod === "cash").reduce((sum, s) => sum + s.totalAmount, 0)
  const cardSales = filteredSales.filter(s => s.paymentMethod === "card").reduce((sum, s) => sum + s.totalAmount, 0)
  const avgSale = filteredSales.length > 0 ? totalSales / filteredSales.length : 0

  const salesColumns: Column<CashSale>[] = [
    {
      header: "Sale ID",
      accessor: "saleNumber",
    },
    {
      header: "Customer",
      accessor: "customerName",
    },
    {
      header: "Products",
      accessor: (row) => `${row.items.length} item(s)`,
    },
    {
      header: "Amount",
      accessor: (row) => `SAR ${row.totalAmount.toFixed(2)}`,
    },
    {
      header: "Payment Method",
      accessor: (row) => <PaymentMethodBadge method={row.paymentMethod} />,
    },
    {
      header: "Date",
      accessor: (row) => format(row.createdAt, "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Van",
      accessor: "vanCode",
    },
    {
      header: "Driver",
      accessor: "driverName",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSale(row)
              setReceiptModalOpen(true)
            }}
            className="cursor-pointer"
            title="View receipt"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleExport = () => {
    const csv = [
      ["Sale ID", "Customer", "Amount", "Payment Method", "Date", "Van", "Driver"],
      ...filteredSales.map((sale) => [
        sale.saleNumber,
        sale.customerName,
        sale.totalAmount.toFixed(2),
        sale.paymentMethod,
        format(sale.createdAt, "MMM dd, yyyy HH:mm"),
        sale.vanCode,
        sale.driverName,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-sales-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Cash Sales & Payments"
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="cursor-pointer"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            ❌ {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {loading ? "..." : `${filteredSales.length} transactions`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Cash Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                SAR {cashSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {loading ? "..." : `${filteredSales.filter(s => s.paymentMethod === "cash").length} cash sales`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Card Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                SAR {cardSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {loading ? "..." : `${filteredSales.filter(s => s.paymentMethod === "card").length} card sales`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Average Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {avgSale.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </Select>
          <Select
            value={vanFilter}
            onChange={(e) => setVanFilter(e.target.value)}
          >
            <option value="all">All Vans</option>
            {vans.map((van) => (
              <option key={van.id} value={van.id}>
                {van.plateNumber}
              </option>
            ))}
          </Select>
          <Select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
          >
            <option value="all">All Drivers</option>
            {drivers.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Sales Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mr-3 text-indigo-500" />
            Loading cash sales...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable data={filteredSales} columns={salesColumns} />
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent onClose={() => setReceiptModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt - {selectedSale?.saleNumber}</DialogTitle>
            <DialogDescription>
              Cash sale receipt details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Jazeera Al Huda</h2>
                <p className="text-sm text-gray-500">Cash Sale Receipt</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Number:</span>
                  <span className="font-semibold">{selectedSale?.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{selectedSale && format(selectedSale.createdAt, "MMM dd, yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-semibold">{selectedSale?.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span>{selectedSale?.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Van:</span>
                  <span>{selectedSale?.vanCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>
                  <span>{selectedSale?.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{selectedSale && <PaymentMethodBadge method={selectedSale.paymentMethod} />}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h3 className="font-semibold mb-3">Items</h3>
                {selectedSale?.items.map((item) => (
                  <div key={item.id} className="flex justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} × SAR {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">SAR {item.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold">SAR {selectedSale?.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReceiptModalOpen(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={() => window.print()}
              className="cursor-pointer"
            >
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










