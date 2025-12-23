"use client"

import { useState } from "react"
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
import { dummyCashSales, dummyVans, dummyReps } from "@/lib/dummy-data"
import { CashSale } from "@/lib/types"
import { format } from "date-fns"
import { Eye, Download } from "lucide-react"

export default function CashSalesPage() {
  const [sales, setSales] = useState(dummyCashSales)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<CashSale | null>(null)

  const filteredSales = sales.filter((sale) => {
    if (vanFilter !== "all" && sale.vanId !== vanFilter) return false
    if (agentFilter !== "all" && sale.driverId !== agentFilter) return false
    
    if (dateFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (sale.createdAt < today) return false
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      if (sale.createdAt < weekAgo) return false
    }
    
    return true
  })

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
      header: "Agent",
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
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const handleExport = () => {
    // Export functionality placeholder
    const csv = [
      ["Sale ID", "Customer", "Amount", "Payment Method", "Date", "Van", "Agent"],
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
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
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
            {dummyVans.map((van) => (
              <option key={van.id} value={van.id}>
                {van.vanCode}
              </option>
            ))}
          </Select>
          <Select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
          >
            <option value="all">All Agents</option>
            {dummyReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <DataTable data={filteredSales} columns={salesColumns} />
        </div>
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
                  <span className="text-gray-600">Agent:</span>
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
            <Button variant="outline" onClick={() => setReceiptModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.print()}>
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










