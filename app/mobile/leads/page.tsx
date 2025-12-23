"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dummyLeads } from "@/lib/dummy-data"
import { Lead } from "@/lib/types"
import { format } from "date-fns"
import { Plus, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function MobileLeadsPage() {
  const [leads, setLeads] = useState(dummyLeads)
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    businessType: "",
    address: "",
    potentialValue: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Create lead logic placeholder
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      businessName: formData.businessName || undefined,
      businessType: formData.businessType || undefined,
      address: formData.address || undefined,
      potentialValue: parseFloat(formData.potentialValue) || 0,
      status: "pending",
      agentId: "1", // Mock agent ID
      agentName: "Current User",
      notes: formData.notes || undefined,
      createdAt: new Date(),
      syncedToOdoo: false,
    }
    setLeads([newLead, ...leads])
    setFormData({
      name: "",
      phone: "",
      email: "",
      businessName: "",
      businessType: "",
      address: "",
      potentialValue: "",
      notes: "",
    })
    setLeadModalOpen(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button size="sm" onClick={() => setLeadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      {/* Past Leads */}
      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                  {lead.businessName && (
                    <p className="text-sm text-gray-500">{lead.businessName}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  lead.status === "approved" ? "bg-green-100 text-green-800" :
                  lead.status === "rejected" ? "bg-red-100 text-red-800" :
                  lead.status === "converted" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {lead.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-500">
                  Potential: SAR {lead.potentialValue.toLocaleString()}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedLead(lead)
                    setViewModalOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Lead Modal */}
      <Dialog open={leadModalOpen} onOpenChange={setLeadModalOpen}>
        <DialogContent onClose={() => setLeadModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Capture New Lead</DialogTitle>
            <DialogDescription>Enter customer lead information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966501234567"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Name</label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Business name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Type</label>
                <Input
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  placeholder="Retail, Wholesale, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Potential Buying Value (SAR)</label>
                <Input
                  type="number"
                  value={formData.potentialValue}
                  onChange={(e) => setFormData({ ...formData, potentialValue: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLeadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Lead Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent onClose={() => setViewModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-sm font-semibold">{selectedLead?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-sm">{selectedLead?.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Potential Value</label>
              <p className="text-sm font-semibold">SAR {selectedLead?.potentialValue.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedLead?.status === "approved" ? "bg-green-100 text-green-800" :
                  selectedLead?.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {selectedLead?.status.toUpperCase()}
                </span>
              </p>
            </div>
            {selectedLead?.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm">{selectedLead.notes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










