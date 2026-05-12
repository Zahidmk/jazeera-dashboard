import { apiCall } from './client'

const BASE = '/api/v1/driver'

// ─── Home ────────────────────────────────────────────────────────────────────
export const getDriverHome = () =>
  apiCall<any>(`${BASE}/home`)

// ─── Deliveries ──────────────────────────────────────────────────────────────
export const getDeliveries = (status?: string) =>
  apiCall<any>(`${BASE}/deliveries${status ? `?status=${status}` : ''}`)

export const getDeliveryById = (id: string) =>
  apiCall<any>(`${BASE}/deliveries/${id}`)

export const updateDeliveryStatus = (id: string, status: string, failureReason?: string) =>
  apiCall<any>(`${BASE}/deliveries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, failureReason }),
  })

export const getDeliveryNavigation = (id: string) =>
  apiCall<any>(`${BASE}/deliveries/${id}/navigate`)

// ─── Cash Sales ──────────────────────────────────────────────────────────────
export const getCart = () =>
  apiCall<any>(`${BASE}/cart`)

export const addCartItem = (productId: string, quantity: number) =>
  apiCall<any>(`${BASE}/cart/items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  })

export const updateCartItem = (itemId: string, quantity: number) =>
  apiCall<any>(`${BASE}/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })

export const removeCartItem = (itemId: string) =>
  apiCall<any>(`${BASE}/cart/items/${itemId}`, { method: 'DELETE' })

export const submitSale = (payload: {
  customerId?: string
  paymentMethod: string
  latitude?: number
  longitude?: number
  notes?: string
}) =>
  apiCall<any>(`${BASE}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// ─── Van Inventory ────────────────────────────────────────────────────────────
export const getVanInventory = () =>
  apiCall<any>(`${BASE}/van/inventory`)

// ─── Stock ───────────────────────────────────────────────────────────────────
export const adjustStock = (productId: string, quantity: number, reason: string, notes?: string) =>
  apiCall<any>(`${BASE}/stock/adjust`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, reason, notes }),
  })

// ─── Leads ───────────────────────────────────────────────────────────────────
export const getLeads = () =>
  apiCall<any>(`${BASE}/leads`)

export const addLead = (payload: {
  name: string
  phone?: string
  address?: string
  notes?: string
  latitude?: number
  longitude?: number
}) =>
  apiCall<any>(`${BASE}/leads`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// ─── Shift ───────────────────────────────────────────────────────────────────
export const startShift = (vanId: string) =>
  apiCall<any>(`${BASE}/shift/start`, {
    method: 'POST',
    body: JSON.stringify({ vanId }),
  })

export const getShiftSummary = () =>
  apiCall<any>(`${BASE}/shift/summary`)

export const endShift = (notes?: string) =>
  apiCall<any>(`${BASE}/shift/end`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
