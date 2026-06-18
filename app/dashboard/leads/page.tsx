"use client"

import { useState, useEffect, useCallback } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { LeadApprovalDialog } from "@/components/LeadApprovalDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lead, Customer } from "@/lib/types"
import { apiCall } from "@/lib/api/client"
import { format } from "date-fns"
import { Check, X, RefreshCw, Loader2 } from "lucide-react"

function normalizeStatus(s: string): Lead["status"] {
  return s.toLowerCase() as Lead["status"]
}

function mapLead(l: any): Lead {
  return {
    id: l.id,
    name: l.name,
    phone: l.phone || "",
    businessName: l.address || undefined,
    address: l.address || undefined,
    potentialValue: 0,
    status: normalizeStatus(l.status),
    agentId: l.driverId,
    agentName: l.driver?.name || "—",
    notes: l.notes || undefined,
    createdAt: new Date(l.createdAt),
    approvedAt: l.approvedAt ? new Date(l.approvedAt) : undefined,
    rejectedAt: l.rejectedAt ? new Date(l.rejectedAt) : undefined,
    syncedToOdoo: !!l.odooLeadId,
  }
}

function mapCustomer(c: any): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || "",
    email: c.email || undefined,
    address: c.address || "",
    salesVolume: 0,
    createdAt: new Date(c.createdAt),
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "100" })
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await apiCall<{ data: unknown[] }>(`/api/v1/admin/leads?${params.toString()}`)
      setLeads((res.data || []).map(mapLead))
    } catch (e) {
      console.error("Failed to fetch leads", e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await apiCall<{ data: unknown[] }>(`/api/v1/admin/customers?limit=100`)
      setCustomers((res.data || []).map(mapCustomer))
    } catch (e) {
      console.error("Failed to fetch customers", e)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    fetchCustomers()
  }, [fetchLeads, fetchCustomers])

  const handleApprove = async (leadId: string) => {
    setActionLoading(leadId + "_approve")
    try {
      await apiCall(`/api/v1/admin/leads/${leadId}/approve`, { method: "PATCH" })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "approved" as Lead["status"], approvedAt: new Date() } : l))
      setLeadModalOpen(false)
    } catch (e) {
      console.error("Approve failed", e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (leadId: string) => {
    setActionLoading(leadId + "_reject")
    try {
      await apiCall(`/api/v1/admin/leads/${leadId}/reject`, { method: "PATCH" })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "rejected" as Lead["status"], rejectedAt: new Date() } : l))
      setLeadModalOpen(false)
    } catch (e) {
      console.error("Reject failed", e)
    } finally {
      setActionLoading(null)
    }
  }

  const uniqueAgents = Array.from(new Map(leads.map(l => [l.agentId, l.agentName])).entries())

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false
    if (agentFilter !== "all" && lead.agentId !== agentFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        (lead.businessName || "").toLowerCase().includes(q) ||
        lead.agentName.toLowerCase().includes(q)
      )
    }
    return true
  })

  const filteredCustomers = customers.filter((customer) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        (customer.address || "").toLowerCase().includes(q) ||
        (customer.email || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const leadsColumns: Column<Lead>[] = [
    { header: "Name", accessor: "name" },
    { header: "Phone", accessor: "phone" },
    { header: "Business", accessor: (row) => row.businessName || "N/A" },
    { header: "Potential Value", accessor: (row) => row.potentialValue > 0 ? `SAR ${row.potentialValue.toLocaleString()}` : "N/A" },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          row.status === "approved" ? "bg-green-100 text-green-800" :
          row.status === "rejected" ? "bg-red-100 text-red-800" :
          row.status === "converted" ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    { header: "Agent", accessor: "agentName" },
    { header: "Date", accessor: (row) => format(row.createdAt, "MMM dd, yyyy") },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedLead(row); setLeadModalOpen(true) }}>
            View
          </Button>
          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading === row.id + "_approve"}
                className="text-green-600 hover:text-green-700"
              >
                {actionLoading === row.id + "_approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(row.id)}
                disabled={actionLoading === row.id + "_reject"}
                className="text-red-600 hover:text-red-700"
              >
                {actionLoading === row.id + "_reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const customersColumns: Column<Customer>[] = [
    { header: "Name", accessor: "name" },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: (row) => row.email || "N/A" },
    { header: "Address", accessor: (row) => row.address || "N/A" },
    { header: "Sales Volume", accessor: (row) => `SAR ${row.salesVolume.toLocaleString()}` },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Leads & Customers"
        actions={
          <Button size="sm" onClick={() => { fetchLeads(); fetchCustomers() }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        <Tabs defaultValue="leads" className="w-full" onValueChange={() => setSearchQuery("")}>
          <TabsList>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
          </TabsList>
 
          <TabsContent value="leads" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="converted">Converted</option>
              </Select>
              <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
                <option value="all">All Agents</option>
                {uniqueAgents.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading leads...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No leads found.</div>
            ) : (
              <div className="overflow-x-auto">
                <DataTable data={filteredLeads} columns={leadsColumns} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <DataTable data={filteredCustomers} columns={customersColumns} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <LeadApprovalDialog
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        lead={selectedLead}
        onApprove={() => selectedLead && handleApprove(selectedLead.id)}
        onReject={() => selectedLead && handleReject(selectedLead.id)}
        onSync={() => setLeadModalOpen(false)}
      />
    </div>
  )
}






