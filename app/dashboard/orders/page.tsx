"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
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
import { dummyOrders, dummyVans, dummyRoutes, dummyReps } from "@/lib/dummy-data"
import { Order, OrderStatus } from "@/lib/types"
import { format } from "date-fns"
import { Eye, RefreshCw } from "lucide-react"

export default function OrdersPage() {
  const [orders, setOrders] = useState(dummyOrders)
  const [dateFilter, setDateFilter] = useState<string>("today")
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [routeFilter, setRouteFilter] = useState<string>("all")
  const [driverFilter, setDriverFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter((order) => {
    if (vanFilter !== "all" && order.vanId !== vanFilter) return false
    if (routeFilter !== "all" && order.routeId !== routeFilter) return false
    if (driverFilter !== "all" && order.driverId !== driverFilter) return false
    if (statusFilter !== "all" && order.status !== statusFilter) return false
    
    if (dateFilter === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (order.deliveryDate < today) return false
    }
    
    return true
  })

  const ordersColumns: Column<Order>[] = [
    {
      header: "Order No",
      accessor: "orderNumber",
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
      header: "Status",
      accessor: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      header: "Delivery Date",
      accessor: (row) => format(row.deliveryDate, "MMM dd, yyyy"),
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
              setSelectedOrder(row)
              setOrderModalOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedOrder(row)
              setStatusModalOpen(true)
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Orders & Deliveries" />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
          >
            <option value="all">All Routes</option>
            {dummyRoutes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </Select>
          <Select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
          >
            <option value="all">All Drivers</option>
            {dummyReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="returned">Returned</option>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <DataTable data={filteredOrders} columns={ordersColumns} />
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent onClose={() => setOrderModalOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Complete order information and delivery timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-sm font-semibold">{selectedOrder?.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm">{selectedOrder?.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm">{selectedOrder?.customerAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Order Items</label>
              <div className="mt-2 space-y-2">
                {selectedOrder?.items.map((item) => (
                  <div key={item.id} className="flex justify-between border rounded p-2">
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
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-lg font-bold">SAR {selectedOrder?.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent onClose={() => setStatusModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Update status for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Status</label>
              <div className="mt-1">
                {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select className="mt-1">
                <option value="pending">Pending</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="partially-delivered">Partially Delivered</option>
                <option value="failed">Failed</option>
                <option value="returned">Returned</option>
              </Select>
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
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setStatusModalOpen(false)}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










