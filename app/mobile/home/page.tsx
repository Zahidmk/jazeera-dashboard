"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, Truck, Loader2 } from "lucide-react"
import Link from "next/link"
import { getDriverHome } from "@/lib/api/driver"

export default function MobileHomePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getDriverHome()
      .then((res: any) => setData(res.data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      </div>
    )
  }

  const stats = data?.stats ?? {}
  const driver = data?.driver ?? {}

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Today's Route</h1>
          <p className="text-gray-600">{driver.name ?? "Driver"}</p>
          <p className="text-sm text-gray-400">Van: {driver.van ?? "Not Assigned"}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <Truck className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalDeliveries ?? 0) - (stats.pendingDeliveries ?? 0)}/{stats.totalDeliveries ?? 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.pendingDeliveries ?? 0} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Van Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStockItems ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">items loaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Link href="/mobile/orders">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Order Delivery</p>
                  <p className="text-sm text-gray-500">{stats.totalDeliveries ?? 0} orders today</p>
                </div>
              </div>
              {(stats.pendingDeliveries ?? 0) > 0 && (
                <div className="text-sm font-semibold text-orange-600">
                  {stats.pendingDeliveries} pending
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/mobile/cash-sales">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Cash Sales</p>
                  <p className="text-sm text-gray-500">Create new sale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mobile/leads">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Capture Lead</p>
                  <p className="text-sm text-gray-500">New customer lead</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mobile/stock">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">Van Stock</p>
                  <p className="text-sm text-gray-500">View current stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}










