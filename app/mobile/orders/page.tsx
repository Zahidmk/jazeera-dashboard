"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dummyOrders } from "@/lib/dummy-data"
import { Order, DeliveryStatus } from "@/lib/types"
import { format } from "date-fns"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function MobileOrdersPage() {
  const [orders, setOrders] = useState(dummyOrders.filter(o => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const orderDate = new Date(o.deliveryDate)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  }))
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [failureReason, setFailureReason] = useState("")

  const handleStatusUpdate = (status: DeliveryStatus) => {
    if (selectedOrder) {
      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, status: status as any, deliveryStatus: status }
          : o
      ))
      setStatusModalOpen(false)
      setSelectedOrder(null)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Today's Orders</h1>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerAddress}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              
              <div className="space-y-2 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.productName}</span>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">SAR {order.totalAmount.toFixed(2)}</span>
                <div className="flex gap-2">
                  {order.status === "pending" || order.status === "out-for-delivery" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setStatusModalOpen(true)
                        }}
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Delivered
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setStatusModalOpen(true)
                        }}
                        className="text-orange-600 border-orange-600"
                      >
                        Partial
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setStatusModalOpen(true)
                        }}
                        className="text-red-600 border-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Update Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent onClose={() => setStatusModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select className="mt-1">
                <option value="delivered">Delivered</option>
                <option value="partially-delivered">Partially Delivered</option>
                <option value="failed">Failed</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes / Failure Reason</label>
              <Input
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Enter notes or reason"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleStatusUpdate("delivered")}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










