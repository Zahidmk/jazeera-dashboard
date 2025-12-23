"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lead, LeadStatus } from "@/lib/types"

interface LeadApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
  onApprove: () => void
  onReject: () => void
  onSync: () => void
}

export function LeadApprovalDialog({
  open,
  onOpenChange,
  lead,
  onApprove,
  onReject,
  onSync,
}: LeadApprovalDialogProps) {
  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Lead Details - {lead.name}</DialogTitle>
          <DialogDescription>
            Review and manage lead information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm font-semibold">{lead.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm">{lead.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{lead.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Business Name</label>
              <p className="text-sm">{lead.businessName || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Business Type</label>
              <p className="text-sm">{lead.businessType || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Potential Value</label>
              <p className="text-sm font-semibold">SAR {lead.potentialValue.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm">{lead.address || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Agent</label>
              <p className="text-sm">{lead.agentName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  lead.status === "approved" ? "bg-green-100 text-green-800" :
                  lead.status === "rejected" ? "bg-red-100 text-red-800" :
                  lead.status === "converted" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {lead.status.toUpperCase()}
                </span>
              </p>
            </div>
            {lead.notes && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm">{lead.notes}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {lead.status === "pending" && (
            <>
              <Button variant="outline" onClick={onReject} className="bg-red-50 text-red-700 hover:bg-red-100">
                Reject
              </Button>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                Approve
              </Button>
            </>
          )}
          {lead.status === "approved" && !lead.syncedToOdoo && (
            <Button onClick={onSync}>
              Sync to Odoo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}










