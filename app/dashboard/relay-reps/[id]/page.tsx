"use client"

import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/Topbar"
import { StatusBadge } from "@/components/StatusBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable, Column } from "@/components/DataTable"
import { dummyRelayReps, dummyVans } from "@/lib/dummy-data"
import { format } from "date-fns"
import { ArrowLeft, Edit, User, Phone, Mail, Calendar, Building2, Truck, Clock, CheckCircle2, AlertCircle, UserPlus, History } from "lucide-react"
import { RelayRep } from "@/lib/types"
import Link from "next/link"

export default function RelayRepDetailPage() {
  const params = useParams()
  const router = useRouter()
  const repId = params.id as string
  
  const rep = dummyRelayReps.find((r) => r.id === repId)
  const assignedVans = rep?.assignedVanIds 
    ? dummyVans.filter((v) => rep.assignedVanIds.includes(v.id))
    : []

  if (!rep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Relay Rep not found</h1>
          <Button onClick={() => router.push("/dashboard/relay-reps")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Relay Reps
          </Button>
        </div>
      </div>
    )
  }

  const replacementHistoryColumns: Column<RelayRep["replacementHistory"][0]>[] = [
    {
      header: "Date",
      accessor: (row) => format(row.date, "MMM dd, yyyy"),
    },
    {
      header: "Van Code",
      accessor: "vanCode",
    },
    {
      header: "Replaced Rep",
      accessor: "replacedRepName",
    },
    {
      header: "Reason",
      accessor: "reason",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Topbar
        title={`Relay Rep Details`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push("/dashboard/relay-reps")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Rep
            </Button>
          </>
        }
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section with Rep Name and Status */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #4F46E5, #4338CA)' }}>
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{rep.name}</h1>
                <p className="text-sm text-slate-600 mt-1">{rep.email || rep.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={rep.status} />
              <Badge variant={rep.type === "backup" ? "secondary" : "default"}>
                {rep.type === "backup" ? "Backup" : "Replacement"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4" style={{ borderLeftColor: '#4F46E5' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned Vans</p>
                  <p className="text-2xl font-bold">{assignedVans.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Currently assigned</p>
                </div>
                <Truck className="h-10 w-10 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#10b981' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Replacements</p>
                  <p className="text-2xl font-bold">{rep.replacementHistory.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total replacements</p>
                </div>
                <History className="h-10 w-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Shift</p>
                  <p className="text-lg font-semibold capitalize">{rep.shift || rep.shiftTiming}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rep.shiftTiming}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Branch</p>
                  <p className="text-lg font-semibold">{rep.branch}</p>
                  <p className="text-xs text-muted-foreground mt-1">Location</p>
                </div>
                <Building2 className="h-10 w-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-semibold text-lg">{rep.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                      <p className="font-semibold">{rep.phone}</p>
                    </div>
                  </div>
                  {rep.email && (
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5" style={{ color: '#4F46E5' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                        <p className="font-semibold">{rep.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Branch</p>
                      <p className="font-semibold">{rep.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5" style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Shift Timing</p>
                      <p className="font-semibold capitalize">{rep.shift || rep.shiftTiming}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Badge variant={rep.type === "backup" ? "secondary" : "default"} className="text-xs">
                        {rep.type === "backup" ? "B" : "R"}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <Badge variant={rep.type === "backup" ? "secondary" : "default"}>
                        {rep.type === "backup" ? "Backup" : "Replacement"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Vans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Assigned Vans
                </CardTitle>
                <CardDescription>Vans currently assigned to this relay representative</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedVans.length > 0 ? (
                  <div className="space-y-3">
                    {assignedVans.map((van) => (
                      <Link key={van.id} href={`/dashboard/vans/${van.id}`}>
                        <div className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Truck className="h-5 w-5" style={{ color: '#4F46E5' }} />
                              </div>
                              <div>
                                <p className="font-semibold">{van.vanCode}</p>
                                <p className="text-sm text-muted-foreground">{van.routeName || "No route assigned"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={van.status} />
                              <p className="text-xs text-muted-foreground mt-1">{van.branch}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No vans assigned</p>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Van
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replacement History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Replacement History
                </CardTitle>
                <CardDescription>History of replacements performed by this relay rep</CardDescription>
              </CardHeader>
              <CardContent>
                {rep.replacementHistory.length > 0 ? (
                  <DataTable data={rep.replacementHistory} columns={replacementHistoryColumns} />
                ) : (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No replacement history recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <StatusBadge status={rep.status} />
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Type</p>
                    <Badge variant={rep.type === "backup" ? "secondary" : "default"}>
                      {rep.type === "backup" ? "Backup" : "Replacement"}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Branch</p>
                    <p className="font-semibold">{rep.branch}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50">
                    <p className="text-sm text-muted-foreground mb-2">Shift</p>
                    <p className="font-semibold capitalize">{rep.shift || rep.shiftTiming}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Availability Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#4F46E5' }} />
                    <div>
                      <p className="text-sm font-medium text-green-900">Available</p>
                      <p className="text-xs text-green-700">Ready for assignment</p>
                    </div>
                  </div>
                  {rep.status === "active" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Assignments</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned to {assignedVans.length} van{assignedVans.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  {rep.status === "on-leave" && (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Currently on leave</span>
                    </div>
                  )}
                  {rep.status === "inactive" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Inactive</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Rep
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Van
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}












