"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiCall } from "@/lib/api/client"
import {
  Search,
  Tag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Loader2,
} from "lucide-react"

/**
 * Shows what one shop actually pays per product.
 *
 * Prices come from the backend, which asks Odoo for the price this customer
 * last paid under its own pricelist (vansales.integration.service
 * .get_last_sale_price). Products the shop has never bought fall back to the
 * catalogue price — that fallback is marked as "List" rather than hidden, so
 * the gaps in a shop's pricing history are visible.
 */

type PricedProduct = {
  id: string
  name: string
  nameAr: string | null
  sku: string
  barcode: string | null
  category: string | null
  unit: string
  priceRetail: number
  priceWhole: number
  imageUrl: string | null
  // Present only because we pass customerId
  customerPrice?: number
  priceSource?: "CUSTOMER_LAST_SALE" | "LIST"
  lastSaleDate?: string | null
}

type ProductsResponse = {
  success: boolean
  data: PricedProduct[]
  meta: { total: number; page: number; limit: number; totalPages: number; customerId: string | null }
}

interface CustomerPricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: { id: string; name: string; odooId: number | null } | null
}

const PAGE_SIZE = 15

export function CustomerPricingDialog({ open, onOpenChange, customer }: CustomerPricingDialogProps) {
  const [products, setProducts] = useState<PricedProduct[]>([])
  const [meta, setMeta] = useState<ProductsResponse["meta"] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    if (!customer) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        customerId: customer.id,
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      if (search.trim()) params.set("q", search.trim())

      const res = await apiCall<ProductsResponse>(`/api/v1/products/search?${params.toString()}`)
      setProducts(res.data ?? [])
      setMeta(res.meta ?? null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load prices")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [customer, page, search])

  // Debounced so typing in the search box does not fire an Odoo lookup per keystroke
  useEffect(() => {
    if (!open) return
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [open, load])

  // Reset to a clean slate whenever a different customer is opened
  useEffect(() => {
    if (open) {
      setSearch("")
      setPage(1)
      setProducts([])
      setMeta(null)
      setError(null)
    }
  }, [open, customer?.id])

  const handleClose = () => onOpenChange(false)

  if (!customer) return null

  const shopPriced = products.filter((p) => p.priceSource === "CUSTOMER_LAST_SALE").length
  const totalPages = meta?.totalPages ?? 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl">
      <DialogContent className="relative max-h-[88vh] flex flex-col" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            Pricing — {customer.name}
          </DialogTitle>
          <DialogDescription>
            What this shop pays per product, from its own pricelist in Odoo.
            {customer.odooId && <span className="ml-1 text-slate-400">Odoo partner #{customer.odooId}</span>}
          </DialogDescription>
        </DialogHeader>

        {/* Shop not linked to Odoo — every row will be a list price, so say it up front */}
        {!customer.odooId && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 mt-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="text-sm">
              This shop is not linked to an Odoo partner yet, so it has no pricelist history.
              Every product below falls back to the catalogue price.
            </span>
          </div>
        )}

        {/* Search + page summary */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU or barcode..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          {!loading && products.length > 0 && (
            <p className="text-xs text-slate-500 whitespace-nowrap">
              <span className="font-semibold text-blue-700">{shopPriced}</span> of {products.length} on
              this page priced from this shop&apos;s history
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mt-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="mt-4 flex-1 overflow-y-auto rounded-lg border border-slate-200">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <Tag className="h-9 w-9 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="font-semibold text-slate-700 px-4 py-2.5">Product</th>
                  <th className="font-semibold text-slate-700 px-4 py-2.5 text-right">List price</th>
                  <th className="font-semibold text-slate-700 px-4 py-2.5 text-right">Shop price</th>
                  <th className="font-semibold text-slate-700 px-4 py-2.5">Source</th>
                  <th className="font-semibold text-slate-700 px-4 py-2.5">Last sold</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const shopPrice = p.customerPrice ?? p.priceRetail
                  const fromHistory = p.priceSource === "CUSTOMER_LAST_SALE"
                  const diff = shopPrice - p.priceRetail
                  const cheaper = diff < -0.001
                  const dearer = diff > 0.001

                  return (
                    <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-800 line-clamp-1" title={p.name}>
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.sku}
                          {p.unit ? ` · ${p.unit}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                        SAR {p.priceRetail.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={`tabular-nums font-semibold ${
                            fromHistory ? "text-blue-700" : "text-slate-600"
                          }`}
                        >
                          SAR {shopPrice.toFixed(2)}
                        </span>
                        {fromHistory && (cheaper || dearer) && (
                          <span
                            className={`ml-2 inline-flex items-center gap-0.5 text-xs ${
                              cheaper ? "text-green-600" : "text-orange-600"
                            }`}
                          >
                            {cheaper ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {fromHistory ? (
                          <Badge
                            variant="outline"
                            className="border-blue-300 text-blue-700 bg-blue-50 text-xs"
                          >
                            Shop pricelist
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-slate-200 text-slate-500 bg-slate-50 text-xs"
                          >
                            List
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                        {p.lastSaleDate ? p.lastSaleDate.split(" ")[0] : "Never bought"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">
            {meta ? `${meta.total} product${meta.total === 1 ? "" : "s"} · page ${meta.page} of ${totalPages}` : ""}
          </p>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
