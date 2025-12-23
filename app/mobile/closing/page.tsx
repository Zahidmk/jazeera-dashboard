"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dummyOrders, dummyCashSales, dummyVanStock } from "@/lib/dummy-data"
import { CheckCircle, DollarSign, Package } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

export default function MobileClosingPage() {
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  // Today's data
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayOrders = dummyOrders.filter(o => {
    const orderDate = new Date(o.deliveryDate)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  })
  const completedDeliveries = todayOrders.filter(o => o.status === "delivered").length
  
  const todayCashSales = dummyCashSales.filter(s => {
    const saleDate = new Date(s.createdAt)
    saleDate.setHours(0, 0, 0, 0)
    return saleDate.getTime() === today.getTime()
  })
  const cashCollected = todayCashSales.reduce((sum, s) => sum + s.totalAmount, 0)
  
  // Remaining stock (mock - would calculate from actual stock minus sales)
  const remainingStock = dummyVanStock
  const remainingStockValue = remainingStock.reduce((sum, s) => sum + s.totalValue, 0)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Daily Closing</h1>
      <p className="text-gray-600">{format(today, "EEEE, MMMM dd, yyyy")}</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Deliveries Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedDeliveries}</div>
            <p className="text-sm text-gray-500 mt-1">
              out of {todayOrders.length} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Cash Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">SAR {cashCollected.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">
              from {todayCashSales.length} cash sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-blue-600" />
              Remaining Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">SAR {remainingStockValue.toFixed(2)}</div>
            <p className="text-sm text-gray-500 mt-1">
              {remainingStock.length} products in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Cash Payments</span>
            <span className="font-semibold">
              SAR {todayCashSales.filter(s => s.paymentMethod === "cash").reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Card Payments</span>
            <span className="font-semibold">
              SAR {todayCashSales.filter(s => s.paymentMethod === "card").reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">UPI Payments</span>
            <span className="font-semibold">
              SAR {todayCashSales.filter(s => s.paymentMethod === "upi").reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => setSubmitModalOpen(true)}
      >
        Submit Daily Closing
      </Button>

      {/* Submit Confirmation Modal */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent onClose={() => setSubmitModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirm Daily Closing</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit today's closing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Deliveries:</span>
              <span className="font-semibold">{completedDeliveries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Collected:</span>
              <span className="font-semibold">SAR {cashCollected.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Stock:</span>
              <span className="font-semibold">SAR {remainingStockValue.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Submit closing logic
              setSubmitModalOpen(false)
              alert("Daily closing submitted successfully!")
            }}>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










