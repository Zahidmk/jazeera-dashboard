"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, FileDown } from "lucide-react"

interface QuotationDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotation: any | null
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
  actionLoading: string | null
}

export function QuotationDetailDialog({
  open,
  onOpenChange,
  quotation,
  onApprove,
  onReject,
  actionLoading,
}: QuotationDetailDialogProps) {
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  if (!quotation) return null

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return
    await onReject(quotation.id, rejectionReason)
    setShowRejectInput(false)
    setRejectionReason("")
  }

  const handleClose = () => {
    setShowRejectInput(false)
    setRejectionReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Quotation Details</DialogTitle>
          <DialogDescription>
            Review and manage quotation requests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Quotation ID</label>
              <p className="text-sm font-semibold truncate" title={quotation.id}>{quotation.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Status</label>
              <p className="mt-0.5">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  quotation.status === "APPROVED" ? "bg-green-100 text-green-800" :
                  quotation.status === "REJECTED" ? "bg-red-100 text-red-800" :
                  quotation.status === "SUBMITTED" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {quotation.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Salesman Name</label>
              <p className="text-sm font-medium">{quotation.salesman?.name || "N/A"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Customer Name</label>
              <p className="text-sm font-medium">{quotation.customer?.name || "Walk-in Customer"}</p>
            </div>
            {quotation.customer?.phone && (
              <div>
                <label className="text-xs font-medium text-gray-500">Customer Phone</label>
                <p className="text-sm">{quotation.customer.phone}</p>
              </div>
            )}
            {quotation.customer?.address && (
              <div>
                <label className="text-xs font-medium text-gray-500">Customer Address</label>
                <p className="text-sm">{quotation.customer.address}</p>
              </div>
            )}
          </div>

          {/* Quotation Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Quotation Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2.5 font-semibold text-gray-600">Product</th>
                    <th className="p-2.5 font-semibold text-gray-600">Qty</th>
                    <th className="p-2.5 font-semibold text-gray-600 text-right">Retail Price</th>
                    <th className="p-2.5 font-semibold text-gray-600 text-right">Requested Price</th>
                    <th className="p-2.5 font-semibold text-gray-600 text-right">Final Item Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotation.items?.map((item: any) => {
                    const finalPrice = item.suggestedMode && item.requestedPrice !== null
                      ? item.requestedPrice
                      : item.unitPrice * (1 - item.discountPct / 100);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-medium text-gray-900">
                          {item.product?.name || "Unknown Product"}
                        </td>
                        <td className="p-2.5 text-gray-700">{item.quantity}</td>
                        <td className="p-2.5 text-gray-700 text-right">SAR {item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-gray-700 text-right">
                          {item.requestedPrice != null ? `SAR ${item.requestedPrice.toFixed(2)}` : "—"}
                        </td>
                        <td className="p-2.5 font-medium text-gray-950 text-right">
                          SAR {finalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-3 bg-gray-50 p-2.5 rounded-lg border">
              <span className="text-xs font-semibold text-gray-600">Total Quotation Value</span>
              <span className="text-sm font-bold text-gray-950">SAR {quotation.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Remarks */}
          {quotation.remarks && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <label className="text-xs font-medium text-gray-500">Remarks</label>
              <p className="text-sm text-gray-700 mt-1">{quotation.remarks}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {quotation.status === "REJECTED" && quotation.rejectionReason && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <label className="text-xs font-medium text-red-800">Rejection Reason</label>
              <p className="text-sm text-red-700 mt-1">{quotation.rejectionReason}</p>
            </div>
          )}

          {/* PDF URL */}
          {quotation.status === "APPROVED" && quotation.pdfUrl && (
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => window.open(quotation.pdfUrl, "_blank")}
              >
                <FileDown className="h-4 w-4" />
                View & Print Approved Quotation PDF
              </Button>
            </div>
          )}

          {/* Rejection Input Form */}
          {showRejectInput && (
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-medium text-gray-700">Please provide a rejection reason:</label>
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                rows={3}
                placeholder="E.g., Price discount is too high, customer needs to commit to more volume..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowRejectInput(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!rejectionReason.trim() || actionLoading === quotation.id + "_reject"}
                  onClick={handleRejectSubmit}
                >
                  {actionLoading === quotation.id + "_reject" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={actionLoading !== null}>
            Close
          </Button>

          {quotation.status === "SUBMITTED" && !showRejectInput && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoading !== null}
                className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
              >
                Reject Request
              </Button>
              <Button
                onClick={() => onApprove(quotation.id)}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading === quotation.id + "_approve" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Approve Quotation
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
