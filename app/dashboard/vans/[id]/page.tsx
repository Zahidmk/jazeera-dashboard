"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable, Column } from "@/components/DataTable"
import { dummyVans, dummyReps, dummySyncLogs } from "@/lib/dummy-data"
import { format } from "date-fns"
import { ArrowLeft, Edit, Package, MapPin, RefreshCw, AlertTriangle, Clock, Truck, User, Phone, Mail, Calendar, Route, Building2, Weight, CheckCircle2, XCircle } from "lucide-react"
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

  const timeSinceSync = van.lastSync 
    ? Math.floor((Date.now() - van.lastSync.getTime()) / (1000 * 60))
    : null

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title={`Van Details`}
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
        {/* Header Section with Van Code and Status */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #4F46E5, #4338CA)' }}>
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{van.vanCode}</h1>
                <p className="text-sm text-slate-600 mt-1">{van.registrationNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={van.status} />
              {van.lastSync && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Last sync: {timeSinceSync && timeSinceSync < 60 ? `${timeSinceSync}m ago` : timeSinceSync && timeSinceSync < 1440 ? `${Math.floor(timeSinceSync / 60)}h ago` : "Over 24h ago"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4" style={{ borderLeftColor: '#4F46E5' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stock Level</p>
                  <p className="text-2xl font-bold">{stockPercentage}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{van.currentLoad || 0} / {van.capacity} kg</p>
                </div>
                <Package className="h-10 w-10 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#10b981' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Available Capacity</p>
                  <p className="text-2xl font-bold">{van.capacity - (van.currentLoad || 0)} kg</p>
                  <p className="text-xs text-muted-foreground mt-1">Ready for loading</p>
                </div>
                <Weight className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Route</p>
                  <p className="text-lg font-semibold line-clamp-1">{van.routeName || "Not assigned"}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {van.branch}
                  </p>
                </div>
                <Route className="h-10 w-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Main Rep</p>
                  <p className="text-lg font-semibold">{mainRep?.name || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mainRep ? `${van.relayRepIds?.length || 0} relay reps` : "No rep assigned"}
                  </p>
                </div>
                <User className="h-10 w-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Van Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Van Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Van Code</p>
                      <p className="font-semibold text-lg">{van.vanCode}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                      <p className="font-semibold">{van.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Branch</p>
                      <p className="font-semibold">{van.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Route className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Route</p>
                      <p className="font-semibold">{van.routeName || "Not assigned"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Weight className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Total Capacity</p>
                      <p className="font-semibold">{van.capacity} kg</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      {van.inventoryLoaded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Inventory Status</p>
                      <Badge variant={van.inventoryLoaded ? "success" : "secondary"}>
                        {van.inventoryLoaded ? "Loaded" : "Not Loaded"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Current Stock
                </CardTitle>
                <CardDescription>Real-time inventory status and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-700">Stock Utilization</span>
                      <span className="text-sm font-bold" style={{ color: '#4F46E5' }}>
                        {stockPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full transition-all ${
                          stockPercentage > 80 ? "bg-red-500" :
                          stockPercentage > 50 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{van.currentLoad || 0} kg loaded</span>
                      <span>{van.capacity} kg capacity</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-muted-foreground mb-2">Available Capacity</p>
                      <p className="text-2xl font-bold" style={{ color: '#4F46E5' }}>
                        {van.capacity - (van.currentLoad || 0)} kg
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50">
                      <p className="text-sm text-muted-foreground mb-2">Current Load</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {van.currentLoad || 0} kg
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sync Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Sync Activity Log</CardTitle>
                <CardDescription>Recent sync attempts and status</CardDescription>
              </CardHeader>
              <CardContent>
                {vanSyncLogs.length > 0 ? (
                  <DataTable data={vanSyncLogs} columns={syncLogsColumns} />
                ) : (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No sync activity recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Assigned Representative */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assigned Representative
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mainRep ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {mainRep.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{mainRep.name}</p>
                        <p className="text-sm text-muted-foreground">{mainRep.role === "main" ? "Main Rep" : "Relay Rep"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mainRep.phone}</span>
                      </div>
                      {mainRep.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{mainRep.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm capitalize">{mainRep.shiftTiming}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{mainRep.branch}</span>
                      </div>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Assignment
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No representative assigned</p>
                    <Button size="sm" className="w-full">
                      Assign Representative
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sync Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Sync Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Last Sync Time</p>
                    <p className="font-semibold text-lg">
                      {van.lastSync ? format(van.lastSync, "MMM dd, yyyy HH:mm:ss") : "Never"}
                    </p>
                    {timeSinceSync && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeSinceSync < 60 ? `${timeSinceSync} minutes ago` : 
                         timeSinceSync < 1440 ? `${Math.floor(timeSinceSync / 60)} hours ago` : 
                         `${Math.floor(timeSinceSync / 1440)} days ago`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Sync Status</p>
                    <Badge variant={van.lastSync ? "success" : "secondary"} className="text-sm py-1 px-3">
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

            {/* Issues & Warnings */}
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
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">High Stock Level</p>
                        <p className="text-xs text-yellow-700 mt-1">Stock is at {stockPercentage}% capacity</p>
                      </div>
                    </div>
                  )}
                  {stockPercentage < 20 && stockPercentage > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">Low Stock Level</p>
                        <p className="text-xs text-red-700 mt-1">Stock is at {stockPercentage}% capacity</p>
                      </div>
                    </div>
                  )}
                  {(!van.lastSync || (van.lastSync && (Date.now() - van.lastSync.getTime()) > 24 * 60 * 60 * 1000)) && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Sync Overdue</p>
                        <p className="text-xs text-yellow-700 mt-1">Last sync was more than 24 hours ago</p>
                      </div>
                    </div>
                  )}
                  {van.status === "maintenance" && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <Truck className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">Under Maintenance</p>
                        <p className="text-xs text-orange-700 mt-1">Van is currently in maintenance</p>
                      </div>
                    </div>
                  )}
                  {stockPercentage >= 20 && stockPercentage <= 90 && van.lastSync && (Date.now() - van.lastSync.getTime()) <= 24 * 60 * 60 * 1000 && van.status !== "maintenance" && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-medium text-green-900">All systems operational</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

