"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { dummyVanStock } from "@/lib/dummy-data"
import { Package, AlertTriangle, QrCode } from "lucide-react"

export default function MobileStockPage() {
  const [stock, setStock] = useState(dummyVanStock)
  const [damageModalOpen, setDamageModalOpen] = useState(false)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<typeof dummyVanStock[0] | null>(null)
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")

  const lowStockItems = stock.filter(s => s.quantity < 10)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Van Stock</h1>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="font-semibold text-orange-800">Low Stock Alert</p>
            </div>
            <p className="text-sm text-orange-700">
              {lowStockItems.length} product(s) are running low
            </p>
          </CardContent>
        </Card>
      )}

      {/* Barcode Scan Placeholder */}
      <Card>
        <CardContent className="p-4">
          <Button className="w-full" variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            Scan Barcode to Add Stock
          </Button>
        </CardContent>
      </Card>

      {/* Stock List */}
      <div className="space-y-3">
        {stock.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500">{item.productSku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} {item.unit}</p>
                  <p className="text-xs text-gray-500">SAR {item.price.toFixed(2)} per {item.unit}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedStock(item)
                    setDamageModalOpen(true)
                  }}
                >
                  Record Damage
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedStock(item)
                    setReturnModalOpen(true)
                  }}
                >
                  Record Return
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Damage Modal */}
      <Dialog open={damageModalOpen} onOpenChange={setDamageModalOpen}>
        <DialogContent onClose={() => setDamageModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Record Damage</DialogTitle>
            <DialogDescription>
              {selectedStock?.productName}
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
              <label className="text-sm font-medium">Damaged Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Damage description"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDamageModalOpen(false)
              setQuantity("")
              setNotes("")
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Record damage logic
              setDamageModalOpen(false)
              setQuantity("")
              setNotes("")
            }}>
              Record Damage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Modal */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent onClose={() => setReturnModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Record Return</DialogTitle>
            <DialogDescription>
              {selectedStock?.productName}
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
              <label className="text-sm font-medium">Return Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Return reason"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReturnModalOpen(false)
              setQuantity("")
              setNotes("")
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Record return logic
              setReturnModalOpen(false)
              setQuantity("")
              setNotes("")
            }}>
              Record Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










