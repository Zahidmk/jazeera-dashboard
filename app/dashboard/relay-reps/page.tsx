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
import { dummyRelayReps, dummyVans } from "@/lib/dummy-data"
import { RelayRep } from "@/lib/types"
import { Plus, Eye } from "lucide-react"

export default function RelayRepsPage() {
  const router = useRouter()
  const [relayReps, setRelayReps] = useState(dummyRelayReps)
  const [addModalOpen, setAddModalOpen] = useState(false)

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
            router.push(`/dashboard/relay-reps/${row.id}`)
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

    </div>
  )
}

