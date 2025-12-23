export type SyncStatus = "success" | "failed" | "pending" | "processing"
export type RepStatus = "active" | "inactive" | "on-leave"
export type VanStatus = "active" | "maintenance" | "inactive"
export type RepRole = "main" | "relay"
export type APIStatus = "active" | "inactive"
export type ShiftTiming = "morning" | "evening" | "night" | "full-day"

export interface Route {
  id: string
  name: string
  vanId: string
  shopCount: number
  shops: Array<{
    id: string
    name: string
    address: string
    contact: string
  }>
}

export interface Inventory {
  vanId: string
  loadedAt: Date
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unit: string
  }>
  totalValue: number
}

export interface Van {
  id: string
  vanCode: string
  registrationNumber: string
  branch: string
  mainRepId?: string
  mainRepName?: string
  relayRepIds: string[]
  relayRepNames: string[]
  capacity: number // in kg or units
  status: VanStatus
  lastSync?: Date
  routeId?: string
  routeName?: string
  inventoryLoaded?: boolean
  currentLoad?: number // current inventory weight/units
}

export interface Rep {
  id: string
  name: string
  phone: string
  email?: string
  role: RepRole
  assignedVanId?: string
  assignedVanCode?: string
  shiftTiming: ShiftTiming
  branch: string
  status: RepStatus
  performance: {
    totalSales: number
    syncSuccessRate: number
    lastSyncDate?: Date
  }
}

export interface RelayRep {
  id: string
  name: string
  phone: string
  email?: string
  assignedVanIds: string[]
  assignedVanCodes: string[]
  assignedVanName?: string
  type?: "backup" | "replacement"
  shift?: string
  shiftTiming: ShiftTiming
  branch: string
  status: RepStatus
  replacementHistory: Array<{
    date: Date
    vanCode: string
    replacedRepId: string
    replacedRepName: string
    reason: string
  }>
}

export interface SyncLog {
  id: string
  repId: string
  repName: string
  vanId: string
  vanCode: string
  type: "sales" | "inventory" | "payment" | "return" | "route"
  status: SyncStatus
  duration?: number
  timestamp: Date
  errorMessage?: string
  retryCount: number
}

export interface QueueItem {
  id: string
  type: "sales_sync" | "inventory_sync" | "payment_sync" | "return_sync" | "route_sync"
  vanId: string
  vanCode: string
  repId: string
  repName: string
  payloadSize: number
  status: "pending" | "processing" | "failed"
  createdAt: Date
  retryCount: number
  priority: "high" | "medium" | "low"
}

export interface APIEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  url: string
  description: string
  status: APIStatus
  category: "van" | "rep" | "inventory" | "sales" | "sync"
}

export interface SystemHealth {
  serverUptime: number
  jobWorkersActive: number
  queueSize: number
  cpuUsage: number
  memoryUsage: number
  apiLatency: number
  timestamp: Date
}

export interface RecentActivity {
  id: string
  type: string
  repName?: string
  vanCode?: string
  status: SyncStatus
  timestamp: Date
  message: string
}

export interface SyncMetrics {
  timestamp: Date
  successRate: number
  attempts: number
  errors: number
}

export interface DashboardKPIs {
  totalVans: number
  activeVans: number
  activeReps: number
  todayDeliveries: number
  syncSuccessRate: number
  failedSyncs: number
  lowStockVans: number
  totalQueueItems: number
}

// New types for Orders & Deliveries
export type OrderStatus = "pending" | "out-for-delivery" | "delivered" | "failed" | "returned"
export type DeliveryStatus = "pending" | "out-for-delivery" | "delivered" | "partially-delivered" | "failed" | "returned"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  vanId: string
  vanCode: string
  routeId: string
  routeName: string
  driverId: string
  driverName: string
  status: OrderStatus
  deliveryStatus: DeliveryStatus
  items: OrderItem[]
  totalAmount: number
  deliveryDate: Date
  createdAt: Date
  notes?: string
}

export interface Delivery {
  id: string
  orderId: string
  orderNumber: string
  status: DeliveryStatus
  deliveredAt?: Date
  notes?: string
  photoUrl?: string
  failureReason?: string
  updatedAt: Date
}

// Cash Sales & Payments
export type PaymentMethod = "cash" | "card" | "upi"

export interface CashSaleItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  total: number
}

export interface CashSale {
  id: string
  saleNumber: string
  vanId: string
  vanCode: string
  driverId: string
  driverName: string
  customerId: string
  customerName: string
  customerPhone: string
  items: CashSaleItem[]
  totalAmount: number
  paymentMethod: PaymentMethod
  createdAt: Date
  receiptUrl?: string
}

// Leads & Customers
export type LeadStatus = "pending" | "approved" | "rejected" | "converted"

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  businessName?: string
  businessType?: string
  address?: string
  potentialValue: number
  status: LeadStatus
  agentId: string
  agentName: string
  vanId?: string
  vanCode?: string
  notes?: string
  createdAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  syncedToOdoo: boolean
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address: string
  routeId?: string
  routeName?: string
  createdFromLeadId?: string
  salesVolume: number
  lastOrderDate?: Date
  createdAt: Date
}

// Products & Stock
export interface Product {
  id: string
  name: string
  sku: string
  unit: string
  price: number
  category?: string
  odooProductId?: string
}

export interface VanStock {
  id: string
  vanId: string
  vanCode: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unit: string
  price: number
  totalValue: number
  loadedAt: Date
  lastUpdated: Date
}

export interface StockHistory {
  id: string
  vanId: string
  vanCode: string
  productId: string
  productName: string
  type: "load" | "sale" | "return" | "damage" | "adjustment"
  quantityChange: number
  previousQuantity: number
  newQuantity: number
  notes?: string
  createdAt: Date
  createdBy: string
}

// Users & Roles
export type UserRole = "super_admin" | "manager" | "driver"
export type UserStatus = "active" | "inactive" | "suspended"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  assignedVanIds: string[]
  assignedVanCodes: string[]
  assignedRouteIds: string[]
  assignedRouteNames: string[]
  branch?: string
  createdAt: Date
  lastLogin?: Date
}