"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getVanInventory, adjustStock } from "@/lib/api/driver"
import { Package, AlertTriangle } from "lucide-react"

export default function MobileStockPage() {
  const [inventory, setInventory] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [damageModalOpen, setDamageModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null)
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getVanInventory()
      .then((res: Record<string, unknown>) => {
        setInventory(((res.data as any)?.items as Record<string, unknown>[]) ?? [])
      })
      .catch((err: unknown) => {
        console.error(err)
        setError("Failed to load inventory")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleAdjust = async (type: "DAMAGE" | "RETURN") => {
    if (!selectedItem || !quantity) return
    setSubmitting(true)
    try {
      await adjustStock(
        selectedItem.productId as string,
        Number(quantity),
        type,
        notes || undefined
      )
      const res = await getVanInventory() as Record<string, unknown>
      setInventory(((res.data as any)?.items as Record<string, unknown>[]) ?? [])
      setDamageModalOpen(false)
      setReturnModalOpen(false)
      setSelectedItem(null)
      setQuantity("")
      setNotes("")
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const lowStockItems = inventory.filter((i) => (i.quantity as number) < 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Van Stock</h1>

      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="font-semibold text-orange-800">Low Stock Alert</p>
            </div>
            <p className="text-sm text-orange-700">
              {lowStockItems.length} product(s) are running low
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {inventory.map((item) => {
          const product = item.product as Record<string, unknown>
          const qty = item.quantity as number
          return (
            <Card key={item.id as string}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-semibold">{product?.name as string}</p>
                      <p className="text-sm text-gray-500">SKU: {product?.sku as string}</p>
                      <p className={`text-sm font-medium mt-1 ${qty < 10 ? "text-orange-600" : "text-green-600"}`}>
                        {qty} {item.unit as string} in stock
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300"
                      onClick={() => { setSelectedItem(item); setDamageModalOpen(true) }}
                    >
                      Damage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedItem(item); setReturnModalOpen(true) }}
                    >
                      Return
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Damage Modal */}
      <Dialog open={damageModalOpen} onOpenChange={setDamageModalOpen}>
        <DialogContent onClose={() => setDamageModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Report Damage</DialogTitle>
            <DialogDescription>
              {(selectedItem?.product as Record<string, unknown>)?.name as string}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              type="number"
              placeholder="Quantity damaged"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDamageModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleAdjust("DAMAGE")}
              disabled={!quantity || submitting}
            >
              {submitting ? "Reporting..." : "Report Damage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent onClose={() => setReturnModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Return to Warehouse</DialogTitle>
            <DialogDescription>
              {(selectedItem?.product as Record<string, unknown>)?.name as string}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              type="number"
              placeholder="Quantity to return"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnModalOpen(false)}>Cancel</Button>
            <Button
              onClick={() => handleAdjust("RETURN")}
              disabled={!quantity || submitting}
            >
              {submitting ? "Processing..." : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
