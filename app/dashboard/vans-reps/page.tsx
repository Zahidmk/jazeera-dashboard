"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Edit, UserPlus, Package, Truck, Users, Loader2, Eye } from "lucide-react"

interface DriverUser {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  isActive: boolean
}

interface VanRecord {
  id: string
  plateNumber: string
  model?: string
  isActive: boolean
  driver?: DriverUser | null
  inventory: { id: string; quantity: number; product: { id: string; name: string; sku: string } }[]
  _count: { shifts: number }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export default function VansRepsPage() {
  const router = useRouter()

  const [vans, setVans] = useState<VanRecord[]>([])
  const [drivers, setDrivers] = useState<DriverUser[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [vanModalOpen, setVanModalOpen] = useState(false)
  const [selectedVan, setSelectedVan] = useState<VanRecord | null>(null)
  const [vanForm, setVanForm] = useState({ plateNumber: "", model: "", driverId: "" })
  const [vanSaving, setVanSaving] = useState(false)
  const [vanError, setVanError] = useState("")

  const [driverModalOpen, setDriverModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverUser | null>(null)
  const [driverForm, setDriverForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [driverSaving, setDriverSaving] = useState(false)
  const [driverError, setDriverError] = useState("")

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignVan, setAssignVan] = useState<VanRecord | null>(null)
  const [assignDriverId, setAssignDriverId] = useState("")
  const [assignSaving, setAssignSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [vansRes, usersRes] = await Promise.all([
        apiCall<ApiResponse<VanRecord[]>>("/api/v1/admin/vans"),
        apiCall<ApiResponse<DriverUser[]>>("/api/v1/admin/users"),
      ])
      setVans(vansRes.data)
      setDrivers(usersRes.data.filter((u) => u.role === "DRIVER"))
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredVans = vans.filter((van) => {
    if (statusFilter === "active") return van.isActive
    if (statusFilter === "inactive") return !van.isActive
    return true
  })

  const totalInventoryItems = (van: VanRecord) =>
    van.inventory.reduce((sum, inv) => sum + inv.quantity, 0)

  const openAddVan = () => {
    setSelectedVan(null)
    setVanForm({ plateNumber: "", model: "", driverId: "" })
    setVanError("")
    setVanModalOpen(true)
  }

  const openEditVan = (van: VanRecord) => {
    setSelectedVan(van)
    setVanForm({ plateNumber: van.plateNumber, model: van.model || "", driverId: van.driver?.id || "" })
    setVanError("")
    setVanModalOpen(true)
  }

  const saveVan = async () => {
    if (!vanForm.plateNumber.trim()) { setVanError("Plate number is required"); return }
    setVanSaving(true)
    setVanError("")
    try {
      if (selectedVan) {
        await apiCall(`/api/v1/admin/vans/${selectedVan.id}`, {
          method: "PATCH",
          body: JSON.stringify({ plateNumber: vanForm.plateNumber, model: vanForm.model || null }),
        })
      } else {
        await apiCall("/api/v1/admin/vans", {
          method: "POST",
          body: JSON.stringify({ plateNumber: vanForm.plateNumber, model: vanForm.model || null, driverId: vanForm.driverId || null }),
        })
      }
      setVanModalOpen(false)
      loadData()
    } catch (err: unknown) {
      setVanError(err instanceof Error ? err.message : "Failed to save van")
    } finally {
      setVanSaving(false)
    }
  }

  const openAddDriver = () => {
    setSelectedDriver(null)
    setDriverForm({ name: "", email: "", phone: "", password: "" })
    setDriverError("")
    setDriverModalOpen(true)
  }

  const openEditDriver = (driver: DriverUser) => {
    setSelectedDriver(driver)
    setDriverForm({ name: driver.name, email: driver.email, phone: driver.phone || "", password: "" })
    setDriverError("")
    setDriverModalOpen(true)
  }

  const saveDriver = async () => {
    if (!driverForm.name.trim() || !driverForm.email.trim()) { setDriverError("Name and email are required"); return }
    if (!selectedDriver && !driverForm.password) { setDriverError("Password is required for new drivers"); return }
    setDriverSaving(true)
    setDriverError("")
    try {
      if (selectedDriver) {
        await apiCall(`/api/v1/admin/users/${selectedDriver.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: driverForm.name, email: driverForm.email, phone: driverForm.phone || null, ...(driverForm.password && { password: driverForm.password }) }),
        })
      } else {
        await apiCall("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({ name: driverForm.name, email: driverForm.email, phone: driverForm.phone || null, password: driverForm.password, role: "DRIVER" }),
        })
      }
      setDriverModalOpen(false)
      loadData()
    } catch (err: unknown) {
      setDriverError(err instanceof Error ? err.message : "Failed to save driver")
    } finally {
      setDriverSaving(false)
    }
  }

  const openAssign = (van: VanRecord) => {
    setAssignVan(van)
    setAssignDriverId(van.driver?.id || "")
    setAssignModalOpen(true)
  }

  const saveAssignment = async () => {
    if (!assignVan) return
    setAssignSaving(true)
    try {
      await apiCall(`/api/v1/admin/vans/${assignVan.id}`, {
        method: "PATCH",
        body: JSON.stringify({ driverId: assignDriverId || null }),
      })
      setAssignModalOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setAssignSaving(false)
    }
  }

  const vansColumns: Column<VanRecord>[] = [
    { header: "Plate Number", accessor: "plateNumber" },
    { header: "Model", accessor: (row) => row.model || <span className="text-slate-400">—</span> },
    {
      header: "Driver",
      accessor: (row) => row.driver ? (
        <div>
          <p className="font-medium">{row.driver.name}</p>
          <p className="text-xs text-slate-500">{row.driver.phone || row.driver.email}</p>
        </div>
      ) : <span className="text-slate-400 text-sm">Unassigned</span>,
    },
    {
      header: "Inventory",
      accessor: (row) => {
        const total = totalInventoryItems(row)
        return total > 0 ? (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">{total} units ({row.inventory.length} SKUs)</span>
          </div>
        ) : <span className="text-slate-400 text-sm">Empty</span>
      },
    },
    { header: "Total Shifts", accessor: (row) => <span className="text-sm">{row._count.shifts}</span> },
    { header: "Status", accessor: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/vans/${row.id}`)} className="cursor-pointer" title="View"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openEditVan(row)} className="cursor-pointer" title="Edit"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openAssign(row)} className="cursor-pointer" title="Assign Driver"><UserPlus className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  const driversColumns: Column<DriverUser>[] = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: (row) => row.phone || <span className="text-slate-400">—</span> },
    { header: "Status", accessor: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditDriver(row)} className="cursor-pointer" title="Edit"><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="cursor-pointer text-xs"
            onClick={() => apiCall(`/api/v1/admin/users/${row.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !row.isActive }) }).then(loadData)}>
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Vans & Drivers"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={openAddDriver} className="hidden sm:flex cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />Add Driver
            </Button>
            <Button size="sm" onClick={openAddVan} className="cursor-pointer">
              <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Add Van</span>
            </Button>
          </>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Total Vans</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{vans.length}</div><p className="text-xs text-slate-500 mt-1">{vans.filter((v) => v.isActive).length} active</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Drivers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{drivers.length}</div><p className="text-xs text-slate-500 mt-1">{drivers.filter((d) => d.isActive).length} active</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Assigned Vans</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{vans.filter((v) => v.driver).length}</div><p className="text-xs text-slate-500 mt-1">With drivers</p></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-slate-600">Loaded Vans</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{vans.filter((v) => totalInventoryItems(v) > 0).length}</div><p className="text-xs text-slate-500 mt-1">Have inventory</p></CardContent></Card>
        </div>

        <div className="flex gap-4 items-center">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData} className="cursor-pointer">Refresh</Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold">Vans</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0"><div className="inline-block min-w-full align-middle"><DataTable data={filteredVans} columns={vansColumns} /></div></div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold">Drivers</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0"><div className="inline-block min-w-full align-middle"><DataTable data={drivers} columns={driversColumns} /></div></div>
          )}
        </div>
      </div>

      {/* Van Modal */}
      <Dialog open={vanModalOpen} onOpenChange={setVanModalOpen}>
        <DialogContent onClose={() => setVanModalOpen(false)} className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedVan ? "Edit Van" : "Add New Van"}</DialogTitle>
            <DialogDescription>{selectedVan ? "Update van information" : "Register a new delivery van"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Plate Number <span className="text-red-500">*</span></label>
              <Input value={vanForm.plateNumber} onChange={(e) => setVanForm({ ...vanForm, plateNumber: e.target.value })} placeholder="e.g. DXB-A-12345" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Model / Description</label>
              <Input value={vanForm.model} onChange={(e) => setVanForm({ ...vanForm, model: e.target.value })} placeholder="e.g. Toyota HiAce 2023" className="mt-1" />
            </div>
            {!selectedVan && (
              <div>
                <label className="text-sm font-medium">Assign Driver (optional)</label>
                <Select value={vanForm.driverId} onChange={(e) => setVanForm({ ...vanForm, driverId: e.target.value })} className="mt-1">
                  <option value="">— No Driver —</option>
                  {drivers.filter((d) => d.isActive).map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                  ))}
                </Select>
              </div>
            )}
            {vanError && <p className="text-sm text-red-500">{vanError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVanModalOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveVan} disabled={vanSaving} className="cursor-pointer">
              {vanSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Van"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Modal */}
      <Dialog open={driverModalOpen} onOpenChange={setDriverModalOpen}>
        <DialogContent onClose={() => setDriverModalOpen(false)} className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
            <DialogDescription>{selectedDriver ? "Update driver information" : "Create a new driver account"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
              <Input value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} placeholder="Ahmed Al Rashidi" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <Input type="email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} placeholder="driver@jazeera.com" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} placeholder="+966501234567" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                {selectedDriver ? "New Password (leave blank to keep current)" : <>Password <span className="text-red-500">*</span></>}
              </label>
              <Input type="password" value={driverForm.password} onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })} placeholder="Minimum 6 characters" className="mt-1" />
            </div>
            {driverError && <p className="text-sm text-red-500">{driverError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverModalOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveDriver} disabled={driverSaving} className="cursor-pointer">
              {driverSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Driver Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent onClose={() => setAssignModalOpen(false)} className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver to Van</DialogTitle>
            <DialogDescription>Van: <strong>{assignVan?.plateNumber}</strong>{assignVan?.model && ` — ${assignVan.model}`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Select Driver</label>
              <Select value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)} className="mt-1">
                <option value="">— Unassign —</option>
                {drivers.filter((d) => d.isActive).map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.email}</option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={saveAssignment} disabled={assignSaving} className="cursor-pointer">
              {assignSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
