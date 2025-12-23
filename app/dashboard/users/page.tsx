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
import { dummyUsers, dummyVans, dummyRoutes } from "@/lib/dummy-data"
import { User, UserRole, UserStatus } from "@/lib/types"
import { format } from "date-fns"
import { Plus, Edit, UserPlus } from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState(dummyUsers)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false
    if (statusFilter !== "all" && user.status !== statusFilter) return false
    return true
  })

  const usersColumns: Column<User>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Role",
      accessor: (row) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
          {row.role.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Assigned Vans",
      accessor: (row) => row.assignedVanCodes.length > 0 ? row.assignedVanCodes.join(", ") : "None",
    },
    {
      header: "Last Login",
      accessor: (row) =>
        row.lastLogin ? format(row.lastLogin, "MMM dd, yyyy HH:mm") : "Never",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row)
              setUserModalOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(row)
              setAssignmentModalOpen(true)
            }}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Users & Role Management"
        actions={
          <Button size="sm" onClick={() => {
            setSelectedUser(null)
            setUserModalOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="driver">Driver</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <DataTable data={filteredUsers} columns={usersColumns} />
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent onClose={() => setUserModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update user information"
                : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                defaultValue={selectedUser?.name}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                defaultValue={selectedUser?.email}
                placeholder="user@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                defaultValue={selectedUser?.phone}
                placeholder="+966501234567"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select defaultValue={selectedUser?.role} className="mt-1">
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedUser?.status} className="mt-1">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Branch</label>
              <Input
                defaultValue={selectedUser?.branch}
                placeholder="Riyadh"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUserModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent onClose={() => setAssignmentModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Assign Vans & Routes</DialogTitle>
            <DialogDescription>
              Assign vans and routes to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Vans</label>
              <Select className="mt-1" multiple>
                {dummyVans.map((van) => (
                  <option key={van.id} value={van.id}>
                    {van.vanCode} - {van.registrationNumber}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Select Routes</label>
              <Select className="mt-1" multiple>
                {dummyRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
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










