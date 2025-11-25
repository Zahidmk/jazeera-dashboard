"use client"

import { useState } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { dummyRelayReps, dummyVans } from "@/lib/dummy-data"
import { RelayRep } from "@/lib/types"
import { Plus, Eye } from "lucide-react"

export default function RelayRepsPage() {
  const [relayReps, setRelayReps] = useState(dummyRelayReps)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRep, setSelectedRep] = useState<RelayRep | null>(null)

  const columns: Column<RelayRep>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Assigned Van",
      accessor: (row) => row.assignedVanName || "Unassigned",
    },
    {
      header: "Type",
      accessor: (row) => (
        <Badge variant={row.type === "backup" ? "secondary" : "default"}>
          {row.type === "backup" ? "Backup" : "Replacement"}
        </Badge>
      ),
    },
    {
      header: "Shift",
      accessor: "shift",
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
            setDetailsOpen(true)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Relay Reps"
        actions={
          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Relay Rep
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        <DataTable data={relayReps} columns={columns} />
      </div>

      {/* Add Relay Rep Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent onClose={() => setAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Relay Rep</DialogTitle>
            <DialogDescription>
              Create a new relay representative entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select className="mt-1">
                <option value="backup">Backup</option>
                <option value="replacement">Replacement</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Shift</label>
              <Select className="mt-1">
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Assigned Van</label>
              <Select className="mt-1">
                <option value="">None</option>
                {dummyVans
                  .filter((v) => v.status === "active")
                  .map((van) => (
                    <option key={van.id} value={van.id}>
                      {van.vanCode}
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="+966501234567" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="email@example.com" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select className="mt-1">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAddModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Drawer */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent onClose={() => setDetailsOpen(false)}>
          <SheetHeader>
            <SheetTitle>{selectedRep?.name}</SheetTitle>
            <SheetDescription>Relay Representative Details</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rep Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedRep?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant={selectedRep?.type === "backup" ? "secondary" : "default"}>
                    {selectedRep?.type === "backup" ? "Backup" : "Replacement"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shift</p>
                  <p className="font-medium">{selectedRep?.shift}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedRep?.status || "active"} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRep?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRep?.email || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Van</p>
                  <p className="font-medium">
                    {selectedRep?.assignedVanName || "Unassigned"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment History</CardTitle>
                <CardDescription>Recent van assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium">Van-001</p>
                    <p className="text-muted-foreground">Jan 15, 2024 - Present</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Van-003</p>
                    <p className="text-muted-foreground">Dec 20, 2023 - Jan 15, 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Availability Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#4F46E5' }} />
                  <p className="text-sm font-medium">Available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

