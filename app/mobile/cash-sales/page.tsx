"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { PaymentMethodBadge } from "@/components/PaymentMethodBadge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dummyCustomers, dummyVanStock, dummyProducts } from "@/lib/dummy-data"
import { CashSaleItem, PaymentMethod } from "@/lib/types"
import { Plus, Minus, X } from "lucide-react"

export default function MobileCashSalesPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [items, setItems] = useState<CashSaleItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [newCustomerModalOpen, setNewCustomerModalOpen] = useState(false)

  const availableStock = dummyVanStock

  const addItem = (productId: string) => {
    const stock = availableStock.find(s => s.productId === productId)
    if (!stock) return

    const existingItem = items.find(i => i.productId === productId)
    if (existingItem) {
      setItems(items.map(i => 
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
      ))
    } else {
      const newItem: CashSaleItem = {
        id: `item-${Date.now()}`,
        productId: stock.productId,
        productName: stock.productName,
        quantity: 1,
        unit: stock.unit,
        price: stock.price,
        total: stock.price,
      }
      setItems([...items, newItem])
    }
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems(items.map(i => 
      i.id === itemId 
        ? { ...i, quantity, total: quantity * i.price }
        : i
    ))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  const handleCompleteSale = () => {
    setReceiptModalOpen(true)
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Cash Sales</h1>

      {/* Customer Selection */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium mb-2 block">Customer</label>
          <div className="flex gap-2">
            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="flex-1"
            >
              <option value="">Select customer</option>
              {dummyCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNewCustomerModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Products */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-medium mb-2 block">Add Products</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableStock.map((stock) => (
              <div key={stock.id} className="flex justify-between items-center p-2 border rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{stock.productName}</p>
                  <p className="text-xs text-gray-500">
                    {stock.quantity} {stock.unit} available - SAR {stock.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem(stock.productId)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Items */}
      {items.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium mb-2 block">Selected Items</label>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">SAR {item.price.toFixed(2)} per {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="ml-4 font-semibold">
                    SAR {item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method & Total */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </Select>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold">SAR {totalAmount.toFixed(2)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleCompleteSale}
            disabled={items.length === 0 || !selectedCustomer}
          >
            Complete Sale
          </Button>
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent onClose={() => setReceiptModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
            <DialogDescription>Receipt</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center border rounded p-4 bg-gray-50">
              <p className="text-2xl font-bold mb-2">SAR {totalAmount.toFixed(2)}</p>
              <PaymentMethodBadge method={paymentMethod} />
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>SAR {item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReceiptModalOpen(false)
              setItems([])
              setSelectedCustomer("")
            }}>
              Close
            </Button>
            <Button onClick={() => window.print()}>
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Modal */}
      <Dialog open={newCustomerModalOpen} onOpenChange={setNewCustomerModalOpen}>
        <DialogContent onClose={() => setNewCustomerModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Name" />
            <Input placeholder="Phone" />
            <Input placeholder="Email (optional)" />
            <Input placeholder="Address" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setNewCustomerModalOpen(false)}>
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










