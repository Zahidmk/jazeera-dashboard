"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
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
import { dummyVans, dummyReps } from "@/lib/dummy-data"
import { Van, Rep } from "@/lib/types"
import { format } from "date-fns"
import { Plus, Edit, UserPlus } from "lucide-react"

export default function VansRepsPage() {
  const [vans, setVans] = useState(dummyVans)
  const [reps, setReps] = useState(dummyReps)
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [vanModalOpen, setVanModalOpen] = useState(false)
  const [repModalOpen, setRepModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedVan, setSelectedVan] = useState<Van | null>(null)
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null)

  const filteredVans = vans.filter((van) => {
    if (branchFilter !== "all" && van.branch !== branchFilter) return false
    if (statusFilter !== "all" && van.status !== statusFilter) return false
    return true
  })

  const branches = Array.from(new Set(vans.map((v) => v.branch)))

  const vansColumns: Column<Van>[] = [
    {
      header: "Van Name",
      accessor: "vanCode",
    },
    {
      header: "Rep",
      accessor: (row) => row.mainRepName || "Unassigned",
    },
    {
      header: "Branch",
      accessor: "branch",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Last Sync",
      accessor: (row) =>
        row.lastSync ? format(row.lastSync, "MMM dd, yyyy HH:mm") : "Never",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVan(row)
              setVanModalOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVan(row)
              setAssignmentModalOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const repsColumns: Column<Rep>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Van",
      accessor: (row) => row.assignedVanCode || "Unassigned",
    },
    {
      header: "Branch",
      accessor: "branch",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Phone",
      accessor: (row) => row.phone || "-",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedRep(row)
            setRepModalOpen(true)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Vans & Reps"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setRepModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rep
            </Button>
            <Button size="sm" onClick={() => setVanModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Van
            </Button>
          </>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        {/* Vans Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Vans</h2>
          <DataTable data={filteredVans} columns={vansColumns} />
        </div>

        {/* Reps Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Representatives</h2>
          <DataTable data={reps} columns={repsColumns} />
        </div>
      </div>

      {/* Add/Edit Van Modal */}
      <Dialog open={vanModalOpen} onOpenChange={setVanModalOpen}>
        <DialogContent onClose={() => setVanModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedVan ? "Edit Van" : "Add Van"}</DialogTitle>
            <DialogDescription>
              {selectedVan
                ? "Update van information"
                : "Create a new van entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Van Name</label>
              <Input
                defaultValue={selectedVan?.vanCode}
                placeholder="Van-001"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Branch</label>
              <Select defaultValue={selectedVan?.branch} className="mt-1">
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedVan?.status} className="mt-1">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVanModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setVanModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Rep Modal */}
      <Dialog open={repModalOpen} onOpenChange={setRepModalOpen}>
        <DialogContent onClose={() => setRepModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedRep ? "Edit Rep" : "Add Rep"}</DialogTitle>
            <DialogDescription>
              {selectedRep
                ? "Update representative information"
                : "Create a new representative entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                defaultValue={selectedRep?.name}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Branch</label>
              <Select defaultValue={selectedRep?.branch} className="mt-1">
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                defaultValue={selectedRep?.phone}
                placeholder="+966501234567"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                defaultValue={selectedRep?.email}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedRep?.status} className="mt-1">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setRepModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent onClose={() => setAssignmentModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Assign Rep to Van</DialogTitle>
            <DialogDescription>
              Select a representative to assign to {selectedVan?.vanCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Representative</label>
              <Select className="mt-1">
                <option value="">Select rep</option>
                {reps
                  .filter((r) => r.status === "active")
                  .map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name}
                    </option>
                  ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setAssignmentModalOpen(false)}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

