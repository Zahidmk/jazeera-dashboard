"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/api/client"
import { Plus, Edit, Loader2, Users, Shield, Truck } from "lucide-react"

interface UserRecord {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  van?: { id: string; plateNumber: string; model?: string } | null
  _count: { deliveries: number; shifts: number }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const ROLES = ["ADMIN", "MANAGER", "DRIVER", "RELAY_REP", "STORE_KEEPER", "SALESMAN"]

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "DRIVER" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiCall<ApiResponse<UserRecord[]>>("/api/v1/admin/users")
      setUsers(res.data)
    } catch (err) {
      console.error("Failed to load users:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false
    if (statusFilter === "active" && !u.isActive) return false
    if (statusFilter === "inactive" && u.isActive) return false
    return true
  })

  const openAdd = () => {
    setSelectedUser(null)
    setForm({ name: "", email: "", phone: "", password: "", role: "DRIVER" })
    setError("")
    setModalOpen(true)
  }

  const openEdit = (user: UserRecord) => {
    setSelectedUser(user)
    setForm({ name: user.name, email: user.email, phone: user.phone || "", password: "", role: user.role })
    setError("")
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required"); return }
    if (!selectedUser && !form.password) { setError("Password is required for new users"); return }
    setSaving(true)
    setError("")
    try {
      if (selectedUser) {
        await apiCall(`/api/v1/admin/users/${selectedUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone || null,
            role: form.role,
            ...(form.password && { password: form.password }),
          }),
        })
      } else {
        await apiCall("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || null, password: form.password, role: form.role }),
        })
      }
      setModalOpen(false)
      loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user: UserRecord) => {
    try {
      await apiCall(`/api/v1/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      loadData()
    } catch (err) { console.error(err) }
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      MANAGER: "bg-purple-100 text-purple-800",
      DRIVER: "bg-indigo-100 text-indigo-800",
      RELAY_REP: "bg-blue-100 text-blue-800",
      STORE_KEEPER: "bg-amber-100 text-amber-800",
      SALESMAN: "bg-emerald-100 text-emerald-800",
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role] || "bg-gray-100 text-gray-800"}`}>
        {role.replace("_", " ")}
      </span>
    )
  }

  const columns: Column<UserRecord>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: (row) => row.phone || <span className="text-slate-400">—</span> },
    { header: "Role", accessor: (row) => roleBadge(row.role) },
    {
      header: "Assigned Van",
      accessor: (row) => row.van ? (
        <span className="text-sm">{row.van.plateNumber}</span>
      ) : <span className="text-slate-400 text-sm">—</span>,
    },
    { header: "Deliveries", accessor: (row) => <span className="text-sm">{row._count.deliveries}</span> },
    { header: "Status", accessor: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="cursor-pointer" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="cursor-pointer text-xs" onClick={() => toggleStatus(row)}>
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="User Management"
        actions={
          <Button size="sm" onClick={openAdd} className="cursor-pointer">
            <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Add User</span>
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{users.length}</div><p className="text-xs text-slate-500 mt-1">{users.filter(u => u.isActive).length} active</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" />Drivers</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{users.filter(u => u.role === "DRIVER").length}</div><p className="text-xs text-slate-500 mt-1">{users.filter(u => u.role === "DRIVER" && u.isActive).length} active</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />Admins/Mgrs</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{users.filter(u => u.role === "ADMIN" || u.role === "MANAGER").length}</div><p className="text-xs text-slate-500 mt-1">with full access</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600"><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Relay Reps</span></CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{users.filter(u => u.role === "RELAY_REP").length}</div><p className="text-xs text-slate-500 mt-1">{users.filter(u => u.role === "RELAY_REP" && u.isActive).length} active</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData} className="cursor-pointer">Refresh</Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <DataTable data={filteredUsers} columns={columns} />
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)} className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>{selectedUser ? "Update user information" : "Create a new user account"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ahmed Al Rashidi" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@jazeera.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+966501234567" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1">
                {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {selectedUser ? "New Password (leave blank to keep current)" : <>Password <span className="text-red-500">*</span></>}
              </label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" className="mt-1" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={save} disabled={saving} className="cursor-pointer">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
