"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/DataTable"
import { dummyVans, dummyReps, dummySyncLogs } from "@/lib/dummy-data"
import { format } from "date-fns"
import { ArrowLeft, Edit, Package, MapPin, RefreshCw, AlertTriangle, Clock, Truck } from "lucide-react"
import { SyncLog } from "@/lib/types"

export default function VanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vanId = params.id as string
  
  const van = dummyVans.find((v) => v.id === vanId)
  const mainRep = van?.mainRepId ? dummyReps.find((r) => r.id === van.mainRepId) : null
  const vanSyncLogs = dummySyncLogs.filter((log) => log.vanId === vanId).slice(0, 10)

  if (!van) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Van not found</h1>
          <Button onClick={() => router.push("/dashboard/vans-reps")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vans
          </Button>
        </div>
      </div>
    )
  }

  const stockPercentage = van.capacity && van.currentLoad 
    ? Math.round((van.currentLoad / van.capacity) * 100)
    : 0

  const syncLogsColumns: Column<SyncLog>[] = [
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Duration",
      accessor: (row) => row.duration ? `${row.duration}ms` : "-",
    },
    {
      header: "Timestamp",
      accessor: (row) => format(row.timestamp, "MMM dd, yyyy HH:mm"),
    },
    {
      header: "Error",
      accessor: (row) => row.errorMessage || "-",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title={`Van Details - ${van.vanCode}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/dashboard/vans-reps")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Van
            </Button>
          </>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Van Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Van Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Van Code</p>
                <p className="font-semibold text-lg">{van.vanCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                <p className="font-semibold">{van.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <StatusBadge status={van.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Branch</p>
                <p className="font-semibold">{van.branch}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Route</p>
                <p className="font-semibold">{van.routeName || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                <p className="font-semibold">{van.capacity} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Rep */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Representative</CardTitle>
          </CardHeader>
          <CardContent>
            {mainRep ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-semibold">{mainRep.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-semibold">{mainRep.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-semibold">{mainRep.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shift</p>
                  <p className="font-semibold">{mainRep.shiftTiming}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No representative assigned</p>
                <Button size="sm">Assign Representative</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Stock Level</span>
                  <span className="text-sm font-semibold">{van.currentLoad || 0} / {van.capacity} kg ({stockPercentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      stockPercentage > 80 ? "bg-red-500" :
                      stockPercentage > 50 ? "bg-yellow-500" :
                      "bg-green-500"
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inventory Loaded</p>
                  <Badge variant={van.inventoryLoaded ? "success" : "secondary"}>
                    {van.inventoryLoaded ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Capacity</p>
                  <p className="font-semibold">{van.capacity - (van.currentLoad || 0)} kg</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Sync & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Sync Time</p>
                  <p className="font-semibold">
                    {van.lastSync ? format(van.lastSync, "MMM dd, yyyy HH:mm:ss") : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sync Status</p>
                  <Badge variant={van.lastSync ? "success" : "secondary"}>
                    {van.lastSync ? "Synced" : "Not Synced"}
                  </Badge>
                </div>
                <Button size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issues & Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockPercentage > 90 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">High stock level ({stockPercentage}%)</span>
                  </div>
                )}
                {stockPercentage < 20 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Low stock level ({stockPercentage}%)</span>
                  </div>
                )}
                {!van.lastSync || (Date.now() - van.lastSync.getTime()) > 24 * 60 * 60 * 1000 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Last sync was more than 24 hours ago</span>
                  </div>
                )}
                {van.status === "maintenance" && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm">Van is under maintenance</span>
                  </div>
                )}
                {(!stockPercentage && !van.lastSync && van.status !== "maintenance") && (
                  <p className="text-sm text-muted-foreground">No issues detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Sync Activity Log</CardTitle>
            <CardDescription>Recent sync attempts and status</CardDescription>
          </CardHeader>
          <CardContent>
            {vanSyncLogs.length > 0 ? (
              <DataTable data={vanSyncLogs} columns={syncLogsColumns} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No sync activity recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

