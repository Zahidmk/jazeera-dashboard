// Van Stock Assignment API - Assign stock to vans
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validationError, notFoundResponse } from '@/lib/api/response'
import { validateQuantities, validateVanCapacity, StockItem } from '@/lib/api/validation'
import { requireRole } from '@/lib/api/auth'
import { dummyVans } from '@/lib/dummy-data'

// Mock van stock data (replace with database later)
const vanStock: Record<string, StockItem[]> = {}

/**
 * GET /api/vans/[id]/stock
 * Get current stock for a specific van
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: vanId } = await params

        // Find van
        const van = dummyVans.find(v => v.id === vanId)
        if (!van) {
            return notFoundResponse('Van')
        }

        // Get van's current stock
        const stock = vanStock[vanId] || []

        return successResponse(
            {
                vanId,
                vanCode: van.vanCode,
                capacity: van.capacity,
                currentLoad: van.currentLoad || 0,
                stock
            },
            'Van stock fetched successfully'
        )
    } catch (error) {
        console.error('Error fetching van stock:', error)
        return errorResponse('Failed to fetch van stock')
    }
}

/**
 * POST /api/vans/[id]/stock
 * Assign stock to a specific van
 * Only accessible by admin and manager roles
 */
export const POST = requireRole(['admin', 'manager'], async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
    user: any
) => {
    try {
        const { id: vanId } = await context.params
        const body = await request.json()
        const { items } = body as { items: StockItem[] }

        // Find van
        const van = dummyVans.find(v => v.id === vanId)
        if (!van) {
            return notFoundResponse('Van')
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return validationError('Items array is required and must not be empty')
        }

        // Validate quantities
        const quantityValidation = validateQuantities(items)
        if (!quantityValidation.isValid) {
            return validationError(quantityValidation.errors || [])
        }

        // Validate van capacity
        const currentLoad = van.currentLoad || 0
        const capacityValidation = validateVanCapacity(
            van.capacity,
            currentLoad,
            items
        )

        if (!capacityValidation.isValid) {
            return validationError(capacityValidation.error || 'Capacity exceeded')
        }

        // TODO: Validate stock availability from inventory
        // For now, assume all items are available

        // Assign stock to van
        if (!vanStock[vanId]) {
            vanStock[vanId] = []
        }

        // Add or update items
        for (const item of items) {
            const existingIndex = vanStock[vanId].findIndex(
                s => s.itemCode === item.itemCode
            )

            if (existingIndex >= 0) {
                // Update existing item quantity
                vanStock[vanId][existingIndex].quantity += item.quantity
            } else {
                // Add new item
                vanStock[vanId].push(item)
            }
        }

        // Calculate new total load
        const newLoad = vanStock[vanId].reduce(
            (sum, item) => sum + ((item.weight || 0) * item.quantity),
            0
        )

        return successResponse(
            {
                vanId,
                vanCode: van.vanCode,
                assignedItems: items.length,
                newLoad,
                capacity: van.capacity,
                assignedBy: user.username,
                timestamp: new Date().toISOString()
            },
            `Successfully assigned ${items.length} items to van ${van.vanCode}`
        )
    } catch (error) {
        console.error('Error assigning stock to van:', error)
        return errorResponse('Failed to assign stock to van')
    }
})
