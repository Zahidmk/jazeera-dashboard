"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentMethodBadge } from "@/components/PaymentMethodBadge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Minus, X, Loader2 } from "lucide-react"
import { getVanInventory, getCart, addCartItem, updateCartItem, removeCartItem, submitSale } from "@/lib/api/driver"

export default function MobileCashSalesPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [lastSale, setLastSale] = useState<any>(null)

  useEffect(() => {
    Promise.all([getVanInventory(), getCart()])
      .then(([invRes, cartRes]: [any, any]) => {
        setInventory(invRes.data ?? [])
        setCart(cartRes.data?.items ?? [])
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddItem = async (productId: string) => {
    try {
      const res: any = await addCartItem(productId, 1)
      setCart(res.data?.items ?? [])
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdateQty = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        const res: any = await removeCartItem(itemId)
        setCart(res.data?.items ?? [])
      } else {
        const res: any = await updateCartItem(itemId, quantity)
        setCart(res.data?.items ?? [])
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res: any = await removeCartItem(itemId)
      setCart(res.data?.items ?? [])
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCompleteSale = async () => {
    setSubmitting(true)
    try {
      // Try to get GPS location
      let latitude: number | undefined
      let longitude: number | undefined
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          )
          latitude = pos.coords.latitude
          longitude = pos.coords.longitude
        } catch { /* no GPS */ }
      }

      const res: any = await submitSale({ paymentMethod, latitude, longitude })
      setLastSale(res.data)
      setCart([])
      setReceiptModalOpen(true)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalAmount = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Cash Sales</h1>

      {/* Add Products from Van Inventory */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium mb-2 block">Van Stock — Tap to Add</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inventory.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} {item.product?.unit} available · SAR {item.product?.price?.toFixed(2) ?? "—"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleAddItem(item.productId)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {inventory.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No stock loaded in van</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cart Items */}
      {cart.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium mb-2 block">Cart</label>
            <div className="space-y-2">
              {cart.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product?.name ?? item.productName}</p>
                    <p className="text-xs text-gray-500">SAR {item.price?.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(item.id)} className="text-red-600">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="ml-4 font-semibold text-sm">
                    SAR {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment & Submit */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold">SAR {totalAmount.toFixed(2)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={handleCompleteSale} disabled={cart.length === 0 || submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {submitting ? "Processing..." : "Complete Sale"}
          </Button>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent onClose={() => setReceiptModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Sale Complete ✅</DialogTitle>
            <DialogDescription>Receipt #{lastSale?.id?.slice(0, 8)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center border rounded p-4 bg-gray-50">
              <p className="text-2xl font-bold mb-2">SAR {lastSale?.totalAmount?.toFixed(2)}</p>
              <PaymentMethodBadge method={lastSale?.paymentMethod?.toLowerCase()} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setReceiptModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










