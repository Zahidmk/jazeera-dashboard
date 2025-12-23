"use client"

import { useState } from "react"
import { Topbar } from "@/components/Topbar"
import { DataTable, Column } from "@/components/DataTable"
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
import { dummyRoutes, dummyVans, dummyReps } from "@/lib/dummy-data"
import { Route } from "@/lib/types"
import { Plus, Edit, MapPin } from "lucide-react"

export default function RoutesPage() {
  const [routes, setRoutes] = useState(dummyRoutes)
  const [vanFilter, setVanFilter] = useState<string>("all")
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  const filteredRoutes = routes.filter((route) => {
    if (vanFilter !== "all" && route.vanId !== vanFilter) return false
    return true
  })

  const routesColumns: Column<Route>[] = [
    {
      header: "Route Name",
      accessor: "name",
    },
    {
      header: "Van",
      accessor: (row) => {
        const van = dummyVans.find((v) => v.id === row.vanId)
        return van?.vanCode || "Unassigned"
      },
    },
    {
      header: "Driver",
      accessor: (row) => {
        const van = dummyVans.find((v) => v.id === row.vanId)
        return van?.mainRepName || "Unassigned"
      },
    },
    {
      header: "Shop Count",
      accessor: "shopCount",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRoute(row)
              setRouteModalOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title="Route Management"
        actions={
          <Button size="sm" onClick={() => {
            setSelectedRoute(null)
            setRouteModalOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <Select
            value={vanFilter}
            onChange={(e) => setVanFilter(e.target.value)}
          >
            <option value="all">All Vans</option>
            {dummyVans.map((van) => (
              <option key={van.id} value={van.id}>
                {van.vanCode}
              </option>
            ))}
          </Select>
        </div>

        {/* Routes Table */}
        <div className="overflow-x-auto">
          <DataTable data={filteredRoutes} columns={routesColumns} />
        </div>
      </div>

      {/* Add/Edit Route Modal */}
      <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
        <DialogContent onClose={() => setRouteModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{selectedRoute ? "Edit Route" : "Create Route"}</DialogTitle>
            <DialogDescription>
              {selectedRoute
                ? "Update route information"
                : "Create a new route"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Route Name</label>
              <Input
                defaultValue={selectedRoute?.name}
                placeholder="Route A - Central Riyadh"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Assign Van</label>
              <Select defaultValue={selectedRoute?.vanId} className="mt-1">
                <option value="">Select van</option>
                {dummyVans.map((van) => (
                  <option key={van.id} value={van.id}>
                    {van.vanCode} - {van.registrationNumber}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Shop Count</label>
              <Input
                type="number"
                defaultValue={selectedRoute?.shopCount}
                placeholder="15"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setRouteModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










