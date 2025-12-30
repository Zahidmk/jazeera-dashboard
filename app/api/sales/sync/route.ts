// Sales Sync API - Sync sales to ERP system
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validationError } from '@/lib/api/response'
import { requireAuth } from '@/lib/api/auth'

interface SaleItem {
    itemCode: string
    itemName: string
    quantity: number
    price: number
    total: number
}

interface Sale {
    id?: string
    vanId: string
    repId: string
    customerId?: string
    customerName?: string
    items: SaleItem[]
    totalAmount: number
    paymentMethod: 'cash' | 'card' | 'credit'
    saleDate: string
    syncStatus?: 'pending' | 'synced' | 'failed'
}

// Mock sales storage (replace with database later)
const salesQueue: Sale[] = []

/**
 * POST /api/sales/sync
 * Sync sales from mobile app to ERP system
 */
export const POST = requireAuth(async (request: NextRequest, context: any, user: any) => {
    try {
        const body = await request.json()
        const { sales } = body as { sales: Sale[] }

        // Validate input
        if (!sales || !Array.isArray(sales) || sales.length === 0) {
            return validationError('Sales array is required and must not be empty')
        }

        const syncResults = {
            total: sales.length,
            synced: 0,
            failed: 0,
            errors: [] as string[]
        }

        // Process each sale
        for (const sale of sales) {
            try {
                // Validate sale data
                if (!sale.vanId || !sale.repId || !sale.items || sale.items.length === 0) {
                    syncResults.failed++
                    syncResults.errors.push(`Invalid sale data for sale ${sale.id || 'unknown'}`)
                    continue
                }

                // Validate total amount
                const calculatedTotal = sale.items.reduce(
                    (sum, item) => sum + item.total,
                    0
                )

                if (Math.abs(calculatedTotal - sale.totalAmount) > 0.01) {
                    syncResults.failed++
                    syncResults.errors.push(
                        `Total amount mismatch for sale ${sale.id}: expected ${calculatedTotal}, got ${sale.totalAmount}`
                    )
                    continue
                }

                // TODO: Update inventory quantities
                // TODO: Sync to Odoo ERP
                // For now, just add to queue

                const saleWithStatus: Sale = {
                    ...sale,
                    id: sale.id || `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    syncStatus: 'synced' // In production, this would be 'pending' initially
                }

                salesQueue.push(saleWithStatus)
                syncResults.synced++
            } catch (error) {
                syncResults.failed++
                syncResults.errors.push(`Error processing sale ${sale.id}: ${error}`)
            }
        }

        // Log sync activity
        console.log(`Sales sync completed by ${user.username}:`, syncResults)

        return successResponse(
            {
                ...syncResults,
                timestamp: new Date().toISOString(),
                syncedBy: user.username
            },
            `Successfully synced ${syncResults.synced} of ${syncResults.total} sales`
        )
    } catch (error) {
        console.error('Error syncing sales:', error)
        return errorResponse('Failed to sync sales to ERP system')
    }
})

/**
 * GET /api/sales/sync
 * Get sync status and queue
 */
export const GET = requireAuth(async (request: NextRequest, context: any, user: any) => {
    try {
        const pendingSales = salesQueue.filter(s => s.syncStatus === 'pending')
        const syncedSales = salesQueue.filter(s => s.syncStatus === 'synced')
        const failedSales = salesQueue.filter(s => s.syncStatus === 'failed')

        return successResponse({
            queue: {
                total: salesQueue.length,
                pending: pendingSales.length,
                synced: syncedSales.length,
                failed: failedSales.length
            },
            recentSales: salesQueue.slice(-10).reverse() // Last 10 sales
        })
    } catch (error) {
        console.error('Error fetching sync status:', error)
        return errorResponse('Failed to fetch sync status')
    }
})
