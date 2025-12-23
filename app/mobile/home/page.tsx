"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { dummyRoutes, dummyOrders, dummyVanStock, dummyVans } from "@/lib/dummy-data"
import { Package, ShoppingCart, DollarSign, Truck } from "lucide-react"
import Link from "next/link"

export default function MobileHomePage() {
  // Get today's route (mock - would come from API)
  const todayRoute = dummyRoutes[0]
  const assignedVan = dummyVans.find(v => v.id === todayRoute.vanId)
  
  // Today's deliveries
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = dummyOrders.filter(o => {
    const orderDate = new Date(o.deliveryDate)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  })
  const completedDeliveries = todayOrders.filter(o => o.status === "delivered").length
  const pendingDeliveries = todayOrders.filter(o => o.status === "pending" || o.status === "out-for-delivery").length
  
  // Starting stock
  const vanStock = dummyVanStock.filter(s => s.vanId === todayRoute.vanId)
  const totalStockValue = vanStock.reduce((sum, s) => sum + s.totalValue, 0)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Today's Route</h1>
          <p className="text-gray-600">{todayRoute.name}</p>
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
            <div className="text-2xl font-bold">{completedDeliveries}/{todayOrders.length}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingDeliveries} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Starting Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR {totalStockValue.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">{vanStock.length} products</p>
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
                  <p className="text-sm text-gray-500">{todayOrders.length} orders today</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${pendingDeliveries > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {pendingDeliveries} pending
                </div>
              </div>
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










