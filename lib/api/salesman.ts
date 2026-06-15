import { apiCall } from './client'

const BASE = '/api/v1/salesman'

// ─── Quotations ──────────────────────────────────────────────────────────────
export const getQuotations = (status?: string, customerId?: string) => {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status.toUpperCase())
  if (customerId && customerId !== 'all') params.set('customerId', customerId)
  return apiCall<any>(`${BASE}/quotations?${params.toString()}`)
}

export const getQuotationById = (id: string) =>
  apiCall<any>(`${BASE}/quotations/${id}`)

export const updateQuotationStatus = (id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) =>
  apiCall<any>(`${BASE}/quotations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
  })

// ─── Visits ──────────────────────────────────────────────────────────────────
export const getVisits = () =>
  apiCall<any>(`${BASE}/visits`)
