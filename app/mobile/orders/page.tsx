"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "@/components/OrderStatusBadge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Loader2, Navigation } from "lucide-react"
import { getDeliveries, updateDeliveryStatus, getDeliveryNavigation } from "@/lib/api/driver"

export default function MobileOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState("DELIVERED")
  const [failureReason, setFailureReason] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getDeliveries()
      .then((res: any) => setOrders(res.data ?? []))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return
    setUpdating(true)
    try {
      await updateDeliveryStatus(selectedOrder.id, selectedStatus, failureReason)
      setOrders(orders.map((o: any) =>
        o.id === selectedOrder.id ? { ...o, status: selectedStatus } : o
      ))
      setStatusModalOpen(false)
      setSelectedOrder(null)
      setFailureReason("")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleNavigate = async (orderId: string) => {
    try {
      const res: any = await getDeliveryNavigation(orderId)
      window.open(res.data.navigationUrls.googleMaps, "_blank")
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Today&apos;s Orders</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {orders.length === 0 && !error && (
        <div className="text-center text-gray-500 py-12">No deliveries assigned today</div>
      )}

      <div className="space-y-3">
        {orders.map((order: any) => (
          <Card key={order.id} className="hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{order.odooRef ?? order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">{order.customer?.name}</p>
                  <p className="text-xs text-gray-500">{order.customer?.address}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="space-y-2 mb-3">
                {(order.items ?? []).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name}</span>
                    <span>{item.quantity} {item.product?.unit}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold">SAR {(order.totalAmount ?? 0).toFixed(2)}</span>
                <div className="flex gap-2">
                  {/* Navigate button — always visible if customer has location */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNavigate(order.id)}
                    className="text-indigo-600 border-indigo-300"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>

                  {(order.status === "PENDING" || order.status === "IN_PROGRESS") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setSelectedStatus("DELIVERED")
                          setStatusModalOpen(true)
                        }}
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order)
                          setSelectedStatus("FAILED")
                          setStatusModalOpen(true)
                        }}
                        className="text-red-600 border-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed
                      </Button>
                    </>
                  )}
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
              {selectedOrder?.customer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="DELIVERED">Delivered</option>
                <option value="PARTIALLY_DELIVERED">Partially Delivered</option>
                <option value="FAILED">Failed</option>
              </select>
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
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










