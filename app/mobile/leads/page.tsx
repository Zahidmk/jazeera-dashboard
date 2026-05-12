"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Eye, Loader2, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getLeads, addLead } from "@/lib/api/driver"

export default function MobileLeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    getLeads()
      .then((res: any) => setLeads(res.data ?? []))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Try to get device GPS
      let latitude: number | undefined
      let longitude: number | undefined
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          )
          latitude = pos.coords.latitude
          longitude = pos.coords.longitude
        } catch {
          // GPS not available — proceed without coordinates
        }
      }

      const res: any = await addLead({ ...formData, latitude, longitude })
      setLeads([res.data, ...leads])
      setFormData({ name: "", phone: "", address: "", notes: "" })
      setLeadModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmitting(false)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button size="sm" onClick={() => setLeadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}

      {leads.length === 0 && !error && (
        <div className="text-center text-gray-500 py-12">No leads yet. Tap &quot;New Lead&quot; to add one.</div>
      )}

      <div className="space-y-3">
        {leads.map((lead: any) => (
          <Card key={lead.id} className="hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                  {lead.address && <p className="text-xs text-gray-500">{lead.address}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {lead.lat && lead.lng && (
                    <MapPin className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    lead.odooLeadId ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {lead.odooLeadId ? "SYNCED" : "PENDING"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setSelectedLead(lead); setViewModalOpen(true) }}
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
            <DialogDescription>GPS location will be captured automatically</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer / shop name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966501234567"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, area, city"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interested in products, follow-up date..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setLeadModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                {submitting ? "Saving..." : "Submit Lead"}
              </Button>
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
              <p className="text-sm">{selectedLead?.phone ?? "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm">{selectedLead?.address ?? "—"}</p>
            </div>
            {selectedLead?.lat && selectedLead?.lng && (
              <div>
                <label className="text-sm font-medium text-gray-500">GPS Location</label>
                <p className="text-sm text-green-600">{selectedLead.lat.toFixed(5)}, {selectedLead.lng.toFixed(5)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Odoo Sync</label>
              <p className="text-sm">{selectedLead?.odooLeadId ? `✅ Synced (ID: ${selectedLead.odooLeadId})` : "⏳ Pending sync"}</p>
            </div>
            {selectedLead?.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm">{selectedLead.notes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










