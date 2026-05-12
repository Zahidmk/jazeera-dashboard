"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getShiftSummary, endShift } from "@/lib/api/driver"
import { CheckCircle, DollarSign, Package, Truck } from "lucide-react"
import { format } from "date-fns"

export default function MobileClosingPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [doneModalOpen, setDoneModalOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getShiftSummary()
      .then((res: Record<string, unknown>) => setSummary(res))
      .catch((err: unknown) => {
        console.error(err)
        setError("Failed to load shift summary")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleEndShift = async () => {
    setSubmitting(true)
    try {
      await endShift(notes || undefined)
      setSubmitModalOpen(false)
      setDoneModalOpen(true)
    } catch (err: unknown) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

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

  const deliveries = summary?.deliveries as Record<string, unknown> | undefined
  const sales = summary?.sales as Record<string, unknown> | undefined
  const inventory = summary?.inventory as Record<string, unknown>[] | undefined

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Daily Closing</h1>
      <p className="text-gray-600">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>

      {/* Deliveries Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5 text-blue-600" />
            Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{deliveries?.total as number ?? 0}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{deliveries?.delivered as number ?? 0}</p>
            <p className="text-xs text-gray-500">Delivered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{deliveries?.failed as number ?? 0}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </div>
        </CardContent>
      </Card>

      {/* Cash Sales Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-green-600" />
            Cash Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{sales?.count as number ?? 0}</p>
            <p className="text-xs text-gray-500">Sales Made</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              SAR {((sales?.total as number) ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Total Collected</p>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Stock */}
      {inventory && inventory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-orange-500" />
              Remaining Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inventory.map((item) => {
              const product = item.product as Record<string, unknown>
              return (
                <div key={item.id as string} className="flex justify-between text-sm">
                  <span>{product?.name as string}</span>
                  <span className="font-medium">{item.quantity as number} {item.unit as string}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* End Shift Button */}
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
        onClick={() => setSubmitModalOpen(true)}
      >
        <CheckCircle className="h-5 w-5 mr-2" />
        End Shift & Submit
      </Button>

      {/* Confirm End Shift Modal */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent onClose={() => setSubmitModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>End Shift</DialogTitle>
            <DialogDescription>
              Confirm that you want to end your shift for today.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleEndShift}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm End Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Done Modal */}
      <Dialog open={doneModalOpen} onOpenChange={setDoneModalOpen}>
        <DialogContent onClose={() => setDoneModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Shift Ended ✅</DialogTitle>
            <DialogDescription>Your shift has been submitted successfully.</DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">Great work today! See you tomorrow.</p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setDoneModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
