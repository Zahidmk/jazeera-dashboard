import {
  Van,
  Rep,
  RelayRep,
  SyncLog,
  QueueItem,
  APIEndpoint,
  SystemHealth,
  RecentActivity,
  SyncMetrics,
  DashboardKPIs,
  Route,
  Order,
  Delivery,
  CashSale,
  Lead,
  Customer,
  Product,
  VanStock,
  User,
  StockHistory,
} from "./types"

export const dummyVans: Van[] = [
  {
    id: "1",
    vanCode: "VAN-001",
    registrationNumber: "ABC-1234",
    branch: "Riyadh",
    mainRepId: "1",
    mainRepName: "Ahmed Ali",
    relayRepIds: ["7", "8"],
    relayRepNames: ["Saeed Mansour", "Tariq Fahad"],
    capacity: 5000, // kg
    status: "active",
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    routeId: "r1",
    routeName: "Route A - Central Riyadh",
    inventoryLoaded: true,
    currentLoad: 4200,
  },
  {
    id: "2",
    vanCode: "VAN-002",
    registrationNumber: "DEF-5678",
    branch: "Jeddah",
    mainRepId: "2",
    mainRepName: "Mohammed Hassan",
    relayRepIds: ["9"],
    relayRepNames: ["Hamad Zaid"],
    capacity: 5000,
    status: "active",
    lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
    routeId: "r2",
    routeName: "Route B - North Jeddah",
    inventoryLoaded: true,
    currentLoad: 3800,
  },
  {
    id: "3",
    vanCode: "VAN-003",
    registrationNumber: "GHI-9012",
    branch: "Dammam",
    mainRepId: "3",
    mainRepName: "Khalid Ibrahim",
    relayRepIds: ["10"],
    relayRepNames: ["Fahad Nasser"],
    capacity: 5000,
    status: "active",
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    routeId: "r3",
    routeName: "Route C - East Dammam",
    inventoryLoaded: true,
    currentLoad: 4500,
  },
  {
    id: "4",
    vanCode: "VAN-004",
    registrationNumber: "JKL-3456",
    branch: "Riyadh",
    mainRepId: "4",
    mainRepName: "Omar Abdullah",
    relayRepIds: ["7"],
    relayRepNames: ["Saeed Mansour"],
    capacity: 5000,
    status: "maintenance",
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    routeId: "r4",
    routeName: "Route D - South Riyadh",
    inventoryLoaded: false,
    currentLoad: 0,
  },
  {
    id: "5",
    vanCode: "VAN-005",
    registrationNumber: "MNO-7890",
    branch: "Jeddah",
    mainRepId: "5",
    mainRepName: "Yusuf Saleh",
    relayRepIds: [],
    relayRepNames: [],
    capacity: 5000,
    status: "active",
    lastSync: new Date(Date.now() - 45 * 60 * 1000),
    routeId: "r5",
    routeName: "Route E - West Jeddah",
    inventoryLoaded: true,
    currentLoad: 3200,
  },
  {
    id: "6",
    vanCode: "VAN-006",
    registrationNumber: "PQR-2468",
    branch: "Dammam",
    mainRepId: undefined,
    mainRepName: undefined,
    relayRepIds: [],
    relayRepNames: [],
    capacity: 5000,
    status: "inactive",
    lastSync: undefined,
    inventoryLoaded: false,
    currentLoad: 0,
  },
]

export const dummyReps: Rep[] = [
  {
    id: "1",
    name: "Ahmed Ali",
    phone: "+966501234567",
    email: "ahmed.ali@example.com",
    role: "main",
    assignedVanId: "1",
    assignedVanCode: "VAN-001",
    shiftTiming: "full-day",
    branch: "Riyadh",
    status: "active",
    performance: {
      totalSales: 125000,
      syncSuccessRate: 98.5,
      lastSyncDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  },
  {
    id: "2",
    name: "Mohammed Hassan",
    phone: "+966502345678",
    email: "mohammed.hassan@example.com",
    role: "main",
    assignedVanId: "2",
    assignedVanCode: "VAN-002",
    shiftTiming: "full-day",
    branch: "Jeddah",
    status: "active",
    performance: {
      totalSales: 142000,
      syncSuccessRate: 97.2,
      lastSyncDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  },
  {
    id: "3",
    name: "Khalid Ibrahim",
    phone: "+966503456789",
    email: "khalid.ibrahim@example.com",
    role: "main",
    assignedVanId: "3",
    assignedVanCode: "VAN-003",
    shiftTiming: "full-day",
    branch: "Dammam",
    status: "active",
    performance: {
      totalSales: 118000,
      syncSuccessRate: 95.8,
      lastSyncDate: new Date(Date.now() - 30 * 60 * 1000),
    },
  },
  {
    id: "4",
    name: "Omar Abdullah",
    phone: "+966504567890",
    email: "omar.abdullah@example.com",
    role: "main",
    assignedVanId: "4",
    assignedVanCode: "VAN-004",
    shiftTiming: "full-day",
    branch: "Riyadh",
    status: "on-leave",
    performance: {
      totalSales: 98000,
      syncSuccessRate: 96.5,
      lastSyncDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  {
    id: "5",
    name: "Yusuf Saleh",
    phone: "+966505678901",
    email: "yusuf.saleh@example.com",
    role: "main",
    assignedVanId: "5",
    assignedVanCode: "VAN-005",
    shiftTiming: "full-day",
    branch: "Jeddah",
    status: "active",
    performance: {
      totalSales: 135000,
      syncSuccessRate: 99.1,
      lastSyncDate: new Date(Date.now() - 45 * 60 * 1000),
    },
  },
]

export const dummyRelayReps: RelayRep[] = [
  {
    id: "7",
    name: "Saeed Mansour",
    phone: "+966507890123",
    email: "saeed.mansour@example.com",
    assignedVanIds: ["1", "4"],
    assignedVanCodes: ["VAN-001", "VAN-004"],
    assignedVanName: "VAN-001",
    type: "backup",
    shift: "Evening",
    shiftTiming: "evening",
    branch: "Riyadh",
    status: "active",
    replacementHistory: [
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        vanCode: "VAN-001",
        replacedRepId: "1",
        replacedRepName: "Ahmed Ali",
        reason: "Emergency leave",
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        vanCode: "VAN-004",
        replacedRepId: "4",
        replacedRepName: "Omar Abdullah",
        reason: "Scheduled leave",
      },
    ],
  },
  {
    id: "8",
    name: "Tariq Fahad",
    phone: "+966508901234",
    email: "tariq.fahad@example.com",
    assignedVanIds: ["1"],
    assignedVanCodes: ["VAN-001"],
    assignedVanName: "VAN-001",
    type: "replacement",
    shift: "Night",
    shiftTiming: "night",
    branch: "Riyadh",
    status: "active",
    replacementHistory: [
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        vanCode: "VAN-001",
        replacedRepId: "1",
        replacedRepName: "Ahmed Ali",
        reason: "Shift rotation",
      },
    ],
  },
  {
    id: "9",
    name: "Hamad Zaid",
    phone: "+966509012345",
    email: "hamad.zaid@example.com",
    assignedVanIds: ["2"],
    assignedVanCodes: ["VAN-002"],
    assignedVanName: "VAN-002",
    type: "backup",
    shift: "Morning",
    shiftTiming: "morning",
    branch: "Jeddah",
    status: "active",
    replacementHistory: [],
  },
  {
    id: "10",
    name: "Fahad Nasser",
    phone: "+966506789012",
    email: "fahad.nasser@example.com",
    assignedVanIds: ["3"],
    assignedVanCodes: ["VAN-003"],
    assignedVanName: "VAN-003",
    type: "replacement",
    shift: "Evening",
    shiftTiming: "evening",
    branch: "Dammam",
    status: "active",
    replacementHistory: [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        vanCode: "VAN-003",
        replacedRepId: "3",
        replacedRepName: "Khalid Ibrahim",
        reason: "Medical leave",
      },
    ],
  },
]

export const dummyRoutes: Route[] = [
  {
    id: "r1",
    name: "Route A - Central Riyadh",
    vanId: "1",
    shopCount: 15,
    shops: Array.from({ length: 15 }, (_, i) => ({
      id: `shop-${i + 1}`,
      name: `Shop ${i + 1}`,
      address: `Central Riyadh, Street ${i + 1}`,
      contact: `+9665${1000000 + i}`,
    })),
  },
  {
    id: "r2",
    name: "Route B - North Jeddah",
    vanId: "2",
    shopCount: 12,
    shops: Array.from({ length: 12 }, (_, i) => ({
      id: `shop-${i + 16}`,
      name: `Shop ${i + 16}`,
      address: `North Jeddah, Avenue ${i + 1}`,
      contact: `+9665${2000000 + i}`,
    })),
  },
  {
    id: "r3",
    name: "Route C - East Dammam",
    vanId: "3",
    shopCount: 18,
    shops: Array.from({ length: 18 }, (_, i) => ({
      id: `shop-${i + 28}`,
      name: `Shop ${i + 28}`,
      address: `East Dammam, Road ${i + 1}`,
      contact: `+9665${3000000 + i}`,
    })),
  },
]

export const dummySyncLogs: SyncLog[] = [
  {
    id: "1",
    repId: "1",
    repName: "Ahmed Ali",
    vanId: "1",
    vanCode: "VAN-001",
    type: "sales",
    status: "success",
    duration: 1250,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    retryCount: 0,
  },
  {
    id: "2",
    repId: "2",
    repName: "Mohammed Hassan",
    vanId: "2",
    vanCode: "VAN-002",
    type: "inventory",
    status: "success",
    duration: 980,
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    retryCount: 0,
  },
  {
    id: "3",
    repId: "3",
    repName: "Khalid Ibrahim",
    vanId: "3",
    vanCode: "VAN-003",
    type: "sales",
    status: "failed",
    duration: 2500,
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    errorMessage: "Connection timeout - Network unavailable",
    retryCount: 2,
  },
  {
    id: "4",
    repId: "1",
    repName: "Ahmed Ali",
    vanId: "1",
    vanCode: "VAN-001",
    type: "payment",
    status: "success",
    duration: 1100,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    retryCount: 0,
  },
  {
    id: "5",
    repId: "5",
    repName: "Yusuf Saleh",
    vanId: "5",
    vanCode: "VAN-005",
    type: "return",
    status: "failed",
    duration: 3200,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    errorMessage: "Invalid payload format - Missing required fields",
    retryCount: 1,
  },
]

export const dummyQueueItems: QueueItem[] = [
  {
    id: "1",
    type: "sales_sync",
    vanId: "1",
    vanCode: "VAN-001",
    repId: "1",
    repName: "Ahmed Ali",
    payloadSize: 2048,
    status: "processing",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    retryCount: 0,
    priority: "high",
  },
  {
    id: "2",
    type: "inventory_sync",
    vanId: "2",
    vanCode: "VAN-002",
    repId: "2",
    repName: "Mohammed Hassan",
    payloadSize: 4096,
    status: "pending",
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    retryCount: 0,
    priority: "medium",
  },
  {
    id: "3",
    type: "payment_sync",
    vanId: "3",
    vanCode: "VAN-003",
    repId: "3",
    repName: "Khalid Ibrahim",
    payloadSize: 1024,
    status: "pending",
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    retryCount: 0,
    priority: "high",
  },
  {
    id: "4",
    type: "sales_sync",
    vanId: "5",
    vanCode: "VAN-005",
    repId: "5",
    repName: "Yusuf Saleh",
    payloadSize: 3072,
    status: "failed",
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    retryCount: 3,
    priority: "high",
  },
]

export const dummyAPIEndpoints: APIEndpoint[] = [
  {
    id: "1",
    name: "Get Van List",
    method: "GET",
    url: "/api/v1/vans",
    description: "Retrieve list of all vans with their details",
    status: "active",
    category: "van",
  },
  {
    id: "2",
    name: "Get Rep List",
    method: "GET",
    url: "/api/v1/reps",
    description: "Retrieve list of all sales representatives",
    status: "active",
    category: "rep",
  },
  {
    id: "3",
    name: "Sync Sales",
    method: "POST",
    url: "/api/v1/sync/sales",
    description: "Sync sales data from Van Sales App to Odoo ERP",
    status: "active",
    category: "sales",
  },
  {
    id: "4",
    name: "Sync Inventory",
    method: "POST",
    url: "/api/v1/sync/inventory",
    description: "Sync inventory loads and stock levels",
    status: "active",
    category: "inventory",
  },
  {
    id: "5",
    name: "Sync Payments",
    method: "POST",
    url: "/api/v1/sync/payments",
    description: "Sync payment transactions",
    status: "active",
    category: "sales",
  },
  {
    id: "6",
    name: "Sync Returns",
    method: "POST",
    url: "/api/v1/sync/returns",
    description: "Sync return transactions",
    status: "active",
    category: "sales",
  },
  {
    id: "7",
    name: "Get Van Status",
    method: "GET",
    url: "/api/v1/vans/{id}/status",
    description: "Get current status of a specific van",
    status: "active",
    category: "van",
  },
  {
    id: "8",
    name: "Get Route Details",
    method: "GET",
    url: "/api/v1/routes/{id}",
    description: "Get route details with shop list",
    status: "active",
    category: "van",
  },
]

export const dummySystemHealth: SystemHealth[] = [
  {
    serverUptime: 7200000,
    jobWorkersActive: 4,
    queueSize: 12,
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    apiLatency: 125,
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    serverUptime: 7260000,
    jobWorkersActive: 4,
    queueSize: 10,
    cpuUsage: 48.5,
    memoryUsage: 64.1,
    apiLatency: 132,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    serverUptime: 7320000,
    jobWorkersActive: 5,
    queueSize: 8,
    cpuUsage: 42.3,
    memoryUsage: 61.5,
    apiLatency: 118,
    timestamp: new Date(),
  },
]

export const dummyRecentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "sales_sync",
    repName: "Ahmed Ali",
    vanCode: "VAN-001",
    status: "success",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    message: "Sales data synced successfully",
  },
  {
    id: "2",
    type: "delivery",
    repName: "Mohammed Hassan",
    vanCode: "VAN-002",
    status: "success",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    message: "Delivery completed: 12 items to Shop-15",
  },
  {
    id: "3",
    type: "payment",
    repName: "Ahmed Ali",
    vanCode: "VAN-001",
    status: "success",
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    message: "Payment received: SAR 1,250.00",
  },
  {
    id: "4",
    type: "inventory_sync",
    repName: "Mohammed Hassan",
    vanCode: "VAN-002",
    status: "success",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    message: "Inventory updated successfully",
  },
  {
    id: "5",
    type: "delivery",
    repName: "Khalid Ibrahim",
    vanCode: "VAN-003",
    status: "success",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    message: "Delivery completed: 8 items to Shop-22",
  },
  {
    id: "6",
    type: "sales_sync",
    repName: "Khalid Ibrahim",
    vanCode: "VAN-003",
    status: "failed",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    message: "Sync failed: Connection timeout",
  },
  {
    id: "7",
    type: "payment",
    repName: "Yusuf Saleh",
    vanCode: "VAN-005",
    status: "success",
    timestamp: new Date(Date.now() - 50 * 60 * 1000),
    message: "Payment received: SAR 890.50",
  },
  {
    id: "8",
    type: "payment_sync",
    repName: "Yusuf Saleh",
    vanCode: "VAN-005",
    status: "success",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    message: "Payment transactions synced",
  },
  {
    id: "9",
    type: "delivery",
    repName: "Omar Abdullah",
    vanCode: "VAN-004",
    status: "success",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    message: "Delivery completed: 15 items to Shop-8",
  },
  {
    id: "10",
    type: "sales_sync",
    repName: "Ahmed Ali",
    vanCode: "VAN-001",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    message: "Sales data synced successfully",
  },
]

export const dummySyncMetrics: SyncMetrics[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
  successRate: 85 + Math.random() * 10,
  attempts: Math.floor(20 + Math.random() * 30),
  errors: Math.floor(2 + Math.random() * 5),
}))

export const getKPIs = (): DashboardKPIs => {
  const totalVans = dummyVans.length
  const activeVans = dummyVans.filter((v) => v.status === "active").length
  const activeReps = dummyReps.filter((r) => r.status === "active").length
  const todayDeliveries = dummyOrders.filter((o) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return o.deliveryDate >= today && o.status === "delivered"
  }).length
  const failedSyncs = dummySyncLogs.filter((log) => log.status === "failed").length
  const successfulSyncs = dummySyncLogs.filter((log) => log.status === "success").length
  const syncSuccessRate = dummySyncLogs.length > 0
    ? Math.round((successfulSyncs / dummySyncLogs.length) * 100)
    : 0
  const lowStockVans = dummyVans.filter((v) => v.inventoryLoaded && (v.currentLoad || 0) < v.capacity * 0.2).length
  const totalQueueItems = dummyQueueItems.length

  return {
    totalVans,
    activeVans,
    activeReps,
    todayDeliveries,
    syncSuccessRate,
    failedSyncs,
    lowStockVans,
    totalQueueItems,
  }
}

// Additional KPI functions
export const getSalesKPIs = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaySales = dummyCashSales.filter((s) => s.createdAt >= today)
    .reduce((sum, s) => sum + s.totalAmount, 0)
  
  const totalSales = dummyCashSales.reduce((sum, s) => sum + s.totalAmount, 0)
  
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekSales = dummyCashSales.filter((s) => s.createdAt >= weekAgo)
    .reduce((sum, s) => sum + s.totalAmount, 0)
  
  return {
    todaySales,
    totalSales,
    weekSales,
  }
}

export const getDeliveryKPIs = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const completed = dummyOrders.filter((o) => 
    o.deliveryDate >= today && o.status === "delivered"
  ).length
  
  const pending = dummyOrders.filter((o) => 
    o.deliveryDate >= today && (o.status === "pending" || o.status === "out-for-delivery")
  ).length
  
  return {
    completed,
    pending,
  }
}

export const getLeadKPIs = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayLeads = dummyLeads.filter((l) => l.createdAt >= today).length
  const pendingApproval = dummyLeads.filter((l) => l.status === "pending").length
  
  return {
    todayLeads,
    pendingApproval,
  }
}

// Products
export const dummyProducts: Product[] = [
  { id: "p1", name: "Rice 5kg", sku: "RICE-5KG", unit: "bag", price: 25.50, category: "Food", odooProductId: "odoo-101" },
  { id: "p2", name: "Flour 2kg", sku: "FLOUR-2KG", unit: "bag", price: 12.00, category: "Food", odooProductId: "odoo-102" },
  { id: "p3", name: "Sugar 1kg", sku: "SUGAR-1KG", unit: "bag", price: 8.50, category: "Food", odooProductId: "odoo-103" },
  { id: "p4", name: "Cooking Oil 1L", sku: "OIL-1L", unit: "bottle", price: 18.00, category: "Food", odooProductId: "odoo-104" },
  { id: "p5", name: "Tea 500g", sku: "TEA-500G", unit: "pack", price: 15.75, category: "Beverages", odooProductId: "odoo-105" },
  { id: "p6", name: "Coffee 250g", sku: "COFFEE-250G", unit: "pack", price: 22.00, category: "Beverages", odooProductId: "odoo-106" },
  { id: "p7", name: "Milk 1L", sku: "MILK-1L", unit: "carton", price: 6.50, category: "Dairy", odooProductId: "odoo-107" },
  { id: "p8", name: "Bread Loaf", sku: "BREAD-LOAF", unit: "piece", price: 3.00, category: "Bakery", odooProductId: "odoo-108" },
]

// Customers
export const dummyCustomers: Customer[] = [
  { id: "c1", name: "Al-Madina Store", phone: "+966501111111", email: "almadina@store.com", address: "Central Riyadh, Street 1", routeId: "r1", routeName: "Route A - Central Riyadh", salesVolume: 45000, lastOrderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  { id: "c2", name: "North Market", phone: "+966502222222", address: "North Jeddah, Avenue 5", routeId: "r2", routeName: "Route B - North Jeddah", salesVolume: 38000, lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) },
  { id: "c3", name: "East Corner Shop", phone: "+966503333333", address: "East Dammam, Road 10", routeId: "r3", routeName: "Route C - East Dammam", salesVolume: 32000, lastOrderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000) },
  { id: "c4", name: "Quick Mart", phone: "+966504444444", address: "Central Riyadh, Street 8", routeId: "r1", routeName: "Route A - Central Riyadh", salesVolume: 28000, lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) },
  { id: "c5", name: "Family Store", phone: "+966505555555", address: "North Jeddah, Avenue 12", routeId: "r2", routeName: "Route B - North Jeddah", salesVolume: 25000, lastOrderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
]

// Leads
export const dummyLeads: Lead[] = [
  { id: "l1", name: "Ahmed Store", phone: "+966506666666", email: "ahmed@store.com", businessName: "Ahmed General Store", businessType: "Retail", address: "Central Riyadh, Street 15", potentialValue: 15000, status: "pending", agentId: "1", agentName: "Ahmed Ali", vanId: "1", vanCode: "VAN-001", notes: "Interested in bulk orders", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), syncedToOdoo: false },
  { id: "l2", name: "Hassan Market", phone: "+966507777777", businessName: "Hassan Supermarket", businessType: "Supermarket", address: "North Jeddah, Avenue 20", potentialValue: 25000, status: "approved", agentId: "2", agentName: "Mohammed Hassan", vanId: "2", vanCode: "VAN-002", notes: "High potential customer", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), syncedToOdoo: true },
  { id: "l3", name: "Ibrahim Shop", phone: "+966508888888", businessType: "Retail", address: "East Dammam, Road 25", potentialValue: 8000, status: "rejected", agentId: "3", agentName: "Khalid Ibrahim", vanId: "3", vanCode: "VAN-003", notes: "Not interested", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), rejectedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), syncedToOdoo: false },
  { id: "l4", name: "Abdullah Trading", phone: "+966509999999", email: "abdullah@trading.com", businessName: "Abdullah Trading Co.", businessType: "Wholesale", address: "Central Riyadh, Street 30", potentialValue: 50000, status: "converted", agentId: "1", agentName: "Ahmed Ali", vanId: "1", vanCode: "VAN-001", notes: "Converted to customer", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), syncedToOdoo: true },
  { id: "l5", name: "Saleh Store", phone: "+966510000000", businessType: "Retail", address: "West Jeddah, Street 5", potentialValue: 12000, status: "pending", agentId: "5", agentName: "Yusuf Saleh", vanId: "5", vanCode: "VAN-005", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), syncedToOdoo: false },
]

// Van Stock
export const dummyVanStock: VanStock[] = [
  { id: "vs1", vanId: "1", vanCode: "VAN-001", productId: "p1", productName: "Rice 5kg", productSku: "RICE-5KG", quantity: 50, unit: "bag", price: 25.50, totalValue: 1275.00, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs2", vanId: "1", vanCode: "VAN-001", productId: "p2", productName: "Flour 2kg", productSku: "FLOUR-2KG", quantity: 80, unit: "bag", price: 12.00, totalValue: 960.00, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs3", vanId: "1", vanCode: "VAN-001", productId: "p3", productName: "Sugar 1kg", productSku: "SUGAR-1KG", quantity: 100, unit: "bag", price: 8.50, totalValue: 850.00, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs4", vanId: "2", vanCode: "VAN-002", productId: "p1", productName: "Rice 5kg", productSku: "RICE-5KG", quantity: 45, unit: "bag", price: 25.50, totalValue: 1147.50, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs5", vanId: "2", vanCode: "VAN-002", productId: "p4", productName: "Cooking Oil 1L", productSku: "OIL-1L", quantity: 60, unit: "bottle", price: 18.00, totalValue: 1080.00, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs6", vanId: "3", vanCode: "VAN-003", productId: "p5", productName: "Tea 500g", productSku: "TEA-500G", quantity: 70, unit: "pack", price: 15.75, totalValue: 1102.50, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "vs7", vanId: "3", vanCode: "VAN-003", productId: "p6", productName: "Coffee 250g", productSku: "COFFEE-250G", quantity: 50, unit: "pack", price: 22.00, totalValue: 1100.00, loadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
]

// Orders
export const dummyOrders: Order[] = [
  {
    id: "o1",
    orderNumber: "ORD-001",
    customerId: "c1",
    customerName: "Al-Madina Store",
    customerPhone: "+966501111111",
    customerAddress: "Central Riyadh, Street 1",
    vanId: "1",
    vanCode: "VAN-001",
    routeId: "r1",
    routeName: "Route A - Central Riyadh",
    driverId: "1",
    driverName: "Ahmed Ali",
    status: "out-for-delivery",
    deliveryStatus: "out-for-delivery",
    items: [
      { id: "oi1", productId: "p1", productName: "Rice 5kg", quantity: 10, unit: "bag", price: 25.50, total: 255.00 },
      { id: "oi2", productId: "p2", productName: "Flour 2kg", quantity: 15, unit: "bag", price: 12.00, total: 180.00 },
    ],
    totalAmount: 435.00,
    deliveryDate: new Date(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "o2",
    orderNumber: "ORD-002",
    customerId: "c2",
    customerName: "North Market",
    customerPhone: "+966502222222",
    customerAddress: "North Jeddah, Avenue 5",
    vanId: "2",
    vanCode: "VAN-002",
    routeId: "r2",
    routeName: "Route B - North Jeddah",
    driverId: "2",
    driverName: "Mohammed Hassan",
    status: "delivered",
    deliveryStatus: "delivered",
    items: [
      { id: "oi3", productId: "p1", productName: "Rice 5kg", quantity: 8, unit: "bag", price: 25.50, total: 204.00 },
      { id: "oi4", productId: "p4", productName: "Cooking Oil 1L", quantity: 12, unit: "bottle", price: 18.00, total: 216.00 },
    ],
    totalAmount: 420.00,
    deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
  },
  {
    id: "o3",
    orderNumber: "ORD-003",
    customerId: "c3",
    customerName: "East Corner Shop",
    customerPhone: "+966503333333",
    customerAddress: "East Dammam, Road 10",
    vanId: "3",
    vanCode: "VAN-003",
    routeId: "r3",
    routeName: "Route C - East Dammam",
    driverId: "3",
    driverName: "Khalid Ibrahim",
    status: "pending",
    deliveryStatus: "pending",
    items: [
      { id: "oi5", productId: "p5", productName: "Tea 500g", quantity: 20, unit: "pack", price: 15.75, total: 315.00 },
      { id: "oi6", productId: "p6", productName: "Coffee 250g", quantity: 15, unit: "pack", price: 22.00, total: 330.00 },
    ],
    totalAmount: 645.00,
    deliveryDate: new Date(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "o4",
    orderNumber: "ORD-004",
    customerId: "c4",
    customerName: "Quick Mart",
    customerPhone: "+966504444444",
    customerAddress: "Central Riyadh, Street 8",
    vanId: "1",
    vanCode: "VAN-001",
    routeId: "r1",
    routeName: "Route A - Central Riyadh",
    driverId: "1",
    driverName: "Ahmed Ali",
    status: "failed",
    deliveryStatus: "failed",
    items: [
      { id: "oi7", productId: "p3", productName: "Sugar 1kg", quantity: 25, unit: "bag", price: 8.50, total: 212.50 },
    ],
    totalAmount: 212.50,
    deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    notes: "Customer not available",
  },
  {
    id: "o5",
    orderNumber: "ORD-005",
    customerId: "c5",
    customerName: "Family Store",
    customerPhone: "+966505555555",
    customerAddress: "North Jeddah, Avenue 12",
    vanId: "2",
    vanCode: "VAN-002",
    routeId: "r2",
    routeName: "Route B - North Jeddah",
    driverId: "2",
    driverName: "Mohammed Hassan",
    status: "returned",
    deliveryStatus: "returned",
    items: [
      { id: "oi8", productId: "p1", productName: "Rice 5kg", quantity: 5, unit: "bag", price: 25.50, total: 127.50 },
    ],
    totalAmount: 127.50,
    deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    notes: "Product damaged during delivery",
  },
]

// Deliveries
export const dummyDeliveries: Delivery[] = [
  { id: "d1", orderId: "o1", orderNumber: "ORD-001", status: "out-for-delivery", updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: "d2", orderId: "o2", orderNumber: "ORD-002", status: "delivered", deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "d3", orderId: "o3", orderNumber: "ORD-003", status: "pending", updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: "d4", orderId: "o4", orderNumber: "ORD-004", status: "failed", failureReason: "Customer not available", updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "d5", orderId: "o5", orderNumber: "ORD-005", status: "returned", notes: "Product damaged during delivery", updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
]

// Cash Sales
export const dummyCashSales: CashSale[] = [
  {
    id: "cs1",
    saleNumber: "CS-001",
    vanId: "1",
    vanCode: "VAN-001",
    driverId: "1",
    driverName: "Ahmed Ali",
    customerId: "c1",
    customerName: "Al-Madina Store",
    customerPhone: "+966501111111",
    items: [
      { id: "csi1", productId: "p1", productName: "Rice 5kg", quantity: 5, unit: "bag", price: 25.50, total: 127.50 },
      { id: "csi2", productId: "p3", productName: "Sugar 1kg", quantity: 10, unit: "bag", price: 8.50, total: 85.00 },
    ],
    totalAmount: 212.50,
    paymentMethod: "cash",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "cs2",
    saleNumber: "CS-002",
    vanId: "2",
    vanCode: "VAN-002",
    driverId: "2",
    driverName: "Mohammed Hassan",
    customerId: "c2",
    customerName: "North Market",
    customerPhone: "+966502222222",
    items: [
      { id: "csi3", productId: "p4", productName: "Cooking Oil 1L", quantity: 8, unit: "bottle", price: 18.00, total: 144.00 },
      { id: "csi4", productId: "p5", productName: "Tea 500g", quantity: 6, unit: "pack", price: 15.75, total: 94.50 },
    ],
    totalAmount: 238.50,
    paymentMethod: "card",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "cs3",
    saleNumber: "CS-003",
    vanId: "3",
    vanCode: "VAN-003",
    driverId: "3",
    driverName: "Khalid Ibrahim",
    customerId: "c3",
    customerName: "East Corner Shop",
    customerPhone: "+966503333333",
    items: [
      { id: "csi5", productId: "p6", productName: "Coffee 250g", quantity: 4, unit: "pack", price: 22.00, total: 88.00 },
    ],
    totalAmount: 88.00,
    paymentMethod: "upi",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
  },
  {
    id: "cs4",
    saleNumber: "CS-004",
    vanId: "1",
    vanCode: "VAN-001",
    driverId: "1",
    driverName: "Ahmed Ali",
    customerId: "c4",
    customerName: "Quick Mart",
    customerPhone: "+966504444444",
    items: [
      { id: "csi6", productId: "p2", productName: "Flour 2kg", quantity: 12, unit: "bag", price: 12.00, total: 144.00 },
      { id: "csi7", productId: "p7", productName: "Milk 1L", quantity: 20, unit: "carton", price: 6.50, total: 130.00 },
    ],
    totalAmount: 274.00,
    paymentMethod: "cash",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

// Users
export const dummyUsers: User[] = [
  { id: "u1", name: "Admin User", email: "admin@jazeera.com", phone: "+966501000000", role: "super_admin", status: "active", assignedVanIds: [], assignedVanCodes: [], assignedRouteIds: [], assignedRouteNames: [], branch: "Riyadh", createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: "u2", name: "Manager One", email: "manager1@jazeera.com", phone: "+966502000000", role: "manager", status: "active", assignedVanIds: ["1", "2"], assignedVanCodes: ["VAN-001", "VAN-002"], assignedRouteIds: ["r1", "r2"], assignedRouteNames: ["Route A - Central Riyadh", "Route B - North Jeddah"], branch: "Riyadh", createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000), lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "u3", name: "Ahmed Ali", email: "ahmed.ali@jazeera.com", phone: "+966501234567", role: "driver", status: "active", assignedVanIds: ["1"], assignedVanCodes: ["VAN-001"], assignedRouteIds: ["r1"], assignedRouteNames: ["Route A - Central Riyadh"], branch: "Riyadh", createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  { id: "u4", name: "Mohammed Hassan", email: "mohammed.hassan@jazeera.com", phone: "+966502345678", role: "driver", status: "active", assignedVanIds: ["2"], assignedVanCodes: ["VAN-002"], assignedRouteIds: ["r2"], assignedRouteNames: ["Route B - North Jeddah"], branch: "Jeddah", createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: "u5", name: "Khalid Ibrahim", email: "khalid.ibrahim@jazeera.com", phone: "+966503456789", role: "driver", status: "active", assignedVanIds: ["3"], assignedVanCodes: ["VAN-003"], assignedRouteIds: ["r3"], assignedRouteNames: ["Route C - East Dammam"], branch: "Dammam", createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000), lastLogin: new Date(Date.now() - 30 * 60 * 1000) },
]

// Stock History
export const dummyStockHistory: StockHistory[] = [
  { id: "sh1", vanId: "1", vanCode: "VAN-001", productId: "p1", productName: "Rice 5kg", type: "load", quantityChange: 50, previousQuantity: 0, newQuantity: 50, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdBy: "u2" },
  { id: "sh2", vanId: "1", vanCode: "VAN-001", productId: "p1", productName: "Rice 5kg", type: "sale", quantityChange: -10, previousQuantity: 50, newQuantity: 40, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), createdBy: "u3" },
  { id: "sh3", vanId: "2", vanCode: "VAN-002", productId: "p4", productName: "Cooking Oil 1L", type: "load", quantityChange: 60, previousQuantity: 0, newQuantity: 60, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdBy: "u2" },
  { id: "sh4", vanId: "2", vanCode: "VAN-002", productId: "p4", productName: "Cooking Oil 1L", type: "sale", quantityChange: -8, previousQuantity: 60, newQuantity: 52, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), createdBy: "u4" },
  { id: "sh5", vanId: "3", vanCode: "VAN-003", productId: "p5", productName: "Tea 500g", type: "load", quantityChange: 70, previousQuantity: 0, newQuantity: 70, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), createdBy: "u2" },
  { id: "sh6", vanId: "1", vanCode: "VAN-001", productId: "p2", productName: "Flour 2kg", type: "damage", quantityChange: -2, previousQuantity: 80, newQuantity: 78, notes: "Damaged during transport", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), createdBy: "u3" },
]
