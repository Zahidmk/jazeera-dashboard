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
