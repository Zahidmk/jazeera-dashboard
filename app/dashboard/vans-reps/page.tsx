"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyVans, dummyReps, dummyRelayReps } from "@/lib/dummy-data"
import { Van, Rep } from "@/lib/types"
import { format } from "date-fns"
import { Plus, Edit, UserPlus, Package, Route, Truck, Eye, Users } from "lucide-react"

export default function VansRepsPage() {
  const router = useRouter()
  const [vans, setVans] = useState(dummyVans)
  const [reps, setReps] = useState(dummyReps)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [vanModalOpen, setVanModalOpen] = useState(false)
  const [repModalOpen, setRepModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedVan, setSelectedVan] = useState<Van | null>(null)
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null)

  const filteredVans = vans.filter((van) => {
    if (statusFilter !== "all" && van.status !== statusFilter) return false
    return true
  })

  const vansColumns: Column<Van>[] = [
    {
      header: "Van Code",
      accessor: "vanCode",
    },
    {
      header: "Registration",
      accessor: "registrationNumber",
    },
    {
      header: "Driver",
      accessor: (row) => row.mainRepName || "Unassigned",
    },

    {
      header: "Route",
      accessor: (row) => row.routeName || "No Route",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Inventory",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.inventoryLoaded ? (
            <>
              <Package className="h-4 w-4" style={{ color: '#4F46E5' }} />
              <span className="text-sm">
                {row.currentLoad} / {row.capacity} kg
              </span>
            </>
          ) : (
            <span className="text-slate-400 text-sm">Not Loaded</span>
          )}
        </div>
      ),
    },
    {
      header: "Last Sync",
      accessor: (row) =>
        row.lastSync ? format(row.lastSync, "MMM dd, HH:mm") : "Never",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          {/* View Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/vans/${row.id}`)}
            title="View van details"
            className="cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVan(row)
              setVanModalOpen(true)
            }}
            title="Edit van details"
            className="cursor-pointer"
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
            title="Assign van to reps"
            className="cursor-pointer"
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
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Assigned Van",
      accessor: (row) => row.assignedVanCode || "Unassigned",
    },
    {
      header: "Shift",
      accessor: (row) => (
        <span className="capitalize">{row.shiftTiming.replace("-", " ")}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
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
          title="Edit driver details"
          className="cursor-pointer"
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRepModalOpen(true)}
              className="hidden sm:flex cursor-pointer"
              title="Add new driver"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
            <Button
              size="sm"
              onClick={() => setVanModalOpen(true)}
              className="cursor-pointer"
              title="Add new van"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Van</span>
            </Button>
          </>
        }
      />
      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Vans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vans.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                {vans.filter((v) => v.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Van Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reps.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                {reps.filter((r) => r.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Vans with Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vans.filter((v) => v.routeId).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Assigned routes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Inventory Loaded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vans.filter((v) => v.inventoryLoaded).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Ready for delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
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
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            <h2 className="text-lg sm:text-xl font-semibold">Vans</h2>
          </div>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <DataTable data={filteredVans} columns={vansColumns} />
            </div>
          </div>
        </div>

        {/* Van Drivers Table */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            <h2 className="text-lg sm:text-xl font-semibold">Van Drivers</h2>
          </div>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <DataTable data={reps} columns={repsColumns} />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Van Modal */}
      <Dialog open={vanModalOpen} onOpenChange={setVanModalOpen}>
        <DialogContent onClose={() => setVanModalOpen(false)} className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVan ? "Edit Van" : "Add Van"}</DialogTitle>
            <DialogDescription>
              {selectedVan
                ? "Update van information"
                : "Create a new van entry"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Van Code</label>
                <Input
                  defaultValue={selectedVan?.vanCode}
                  placeholder="VAN-001"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Registration Number</label>
                <Input
                  defaultValue={selectedVan?.registrationNumber}
                  placeholder="ABC-1234"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Capacity (kg)</label>
              <Input
                type="number"
                defaultValue={selectedVan?.capacity}
                placeholder="5000"
                className="mt-1"
              />
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
            <Button variant="outline" onClick={() => setVanModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={() => setVanModalOpen(false)} className="cursor-pointer">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Rep Modal */}
      <Dialog open={repModalOpen} onOpenChange={setRepModalOpen}>
        <DialogContent onClose={() => setRepModalOpen(false)} className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRep ? "Edit Driver" : "Add Driver"}</DialogTitle>
            <DialogDescription>
              {selectedRep
                ? "Update driver information"
                : "Add a new van driver"}
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Shift</label>
                <Select defaultValue={selectedRep?.shiftTiming} className="mt-1">
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </Select>
              </div>
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
            <Button variant="outline" onClick={() => setRepModalOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={() => setRepModalOpen(false)} className="cursor-pointer">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent onClose={() => setAssignmentModalOpen(false)} className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Rep to Van</DialogTitle>
            <DialogDescription>
              Manage rep assignments for {selectedVan?.vanCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Main Rep</label>
              <Select className="mt-1">
                <option value="">Select main rep</option>
                {reps
                  .filter((r) => r.role === "main" && r.status === "active")
                  .map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} - {rep.assignedVanCode || "Unassigned"}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Relay Reps (Multiple)</label>
              <Select multiple className="mt-1 h-32">
                {dummyRelayReps
                  .filter((r) => r.status === "active")
                  .map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} - {rep.shiftTiming}
                    </option>
                  ))}
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Hold Ctrl/Cmd to select multiple relay reps
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentModalOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={() => setAssignmentModalOpen(false)} className="cursor-pointer">
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
