// ─── Backend API utility ─────────────────────────────────────────────────────
// Fetches real data from the Jazeera backend which talks to Odoo

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API returned failure')
  return json.data as T
}

// ─── Odoo Products ───────────────────────────────────────────────────────────
export interface OdooProduct {
  id: number
  name: string
  sku: string
  barcode: string | null
  category: string | null
  unit: string
  priceRetail: number
  priceWhole: number
  qtyAvailable: number
  imageUrl: string | null
  isActive: boolean
}

export async function fetchOdooProducts(limit = 500): Promise<OdooProduct[]> {
  return apiFetch<OdooProduct[]>(`/api/v1/odoo/products?limit=${limit}`)
}

// ─── Odoo Orders ─────────────────────────────────────────────────────────────
export interface OdooOrderItem {
  productId: number | null
  productName: string
  qty: number
  unitPrice: number
  subtotal: number
}

export interface OdooOrder {
  id: number
  orderNumber: string
  customerName: string
  customerId: number | null
  dateOrder: string
  state: string
  totalAmount: number
  items: OdooOrderItem[]
}

export async function fetchOdooOrders(limit = 200): Promise<OdooOrder[]> {
  return apiFetch<OdooOrder[]>(`/api/v1/odoo/orders?limit=${limit}`)
}

// ─── Odoo Customers ──────────────────────────────────────────────────────────
export interface OdooCustomer {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
  lat: number | null
  lng: number | null
}

export async function fetchOdooCustomers(limit = 500): Promise<OdooCustomer[]> {
  return apiFetch<OdooCustomer[]>(`/api/v1/odoo/customers?limit=${limit}`)
}

// ─── Odoo Stock (warehouse) ──────────────────────────────────────────────────
export interface OdooStockItem {
  productId: number
  productName: string
  sku: string | null
  imageUrl: string | null
  totalQty: number
  locations: { location: string; qty: number }[]
}

export async function fetchOdooStock(limit = 1000): Promise<OdooStockItem[]> {
  return apiFetch<OdooStockItem[]>(`/api/v1/odoo/stock?limit=${limit}`)
}
