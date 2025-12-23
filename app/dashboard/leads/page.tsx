"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { LeadApprovalDialog } from "@/components/LeadApprovalDialog"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dummyLeads, dummyCustomers, dummyReps } from "@/lib/dummy-data"
import { Lead, Customer, LeadStatus } from "@/lib/types"
import { format } from "date-fns"
import { Check, X, RefreshCw, Plus } from "lucide-react"

export default function LeadsPage() {
  const [leads, setLeads] = useState(dummyLeads)
  const [customers, setCustomers] = useState(dummyCustomers)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== "all" && lead.status !== statusFilter) return false
    if (agentFilter !== "all" && lead.agentId !== agentFilter) return false
    return true
  })

  const leadsColumns: Column<Lead>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Business",
      accessor: (row) => row.businessName || "N/A",
    },
    {
      header: "Potential Value",
      accessor: (row) => `SAR ${row.potentialValue.toLocaleString()}`,
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === "approved" ? "bg-green-100 text-green-800" :
            row.status === "rejected" ? "bg-red-100 text-red-800" :
              row.status === "converted" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
          }`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Agent",
      accessor: "agentName",
    },
    {
      header: "Date",
      accessor: (row) => format(row.createdAt, "MMM dd, yyyy"),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLead(row)
              setLeadModalOpen(true)
            }}
          >
            View
          </Button>
          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Approve logic
                  setLeads(leads.map(l => l.id === row.id ? { ...l, status: "approved" as LeadStatus, approvedAt: new Date() } : l))
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Reject logic
                  setLeads(leads.map(l => l.id === row.id ? { ...l, status: "rejected" as LeadStatus, rejectedAt: new Date() } : l))
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {row.status === "approved" && !row.syncedToOdoo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Sync logic
                setLeads(leads.map(l => l.id === row.id ? { ...l, syncedToOdoo: true } : l))
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const customersColumns: Column<Customer>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Email",
      accessor: (row) => row.email || "N/A",
    },
    {
      header: "Route",
      accessor: (row) => row.routeName || "Unassigned",
    },
    {
      header: "Sales Volume",
      accessor: (row) => `SAR ${row.salesVolume.toLocaleString()}`,
    },
    {
      header: "Last Order",
      accessor: (row) => row.lastOrderDate ? format(row.lastOrderDate, "MMM dd, yyyy") : "Never",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Leads & Customers"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        <Tabs defaultValue="leads" className="w-full">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="converted">Converted</option>
              </Select>
              <Select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
              >
                <option value="all">All Agents</option>
                {dummyReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <DataTable data={filteredLeads} columns={leadsColumns} />
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Customers Table */}
            <div className="overflow-x-auto">
              <DataTable data={customers} columns={customersColumns} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Approval Dialog */}
      <LeadApprovalDialog
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        lead={selectedLead}
        onApprove={() => {
          if (selectedLead) {
            setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: "approved" as LeadStatus, approvedAt: new Date() } : l))
            setLeadModalOpen(false)
          }
        }}
        onReject={() => {
          if (selectedLead) {
            setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, status: "rejected" as LeadStatus, rejectedAt: new Date() } : l))
            setLeadModalOpen(false)
          }
        }}
        onSync={() => {
          if (selectedLead) {
            setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, syncedToOdoo: true } : l))
            setLeadModalOpen(false)
          }
        }}
      />
    </div>
  )
}










