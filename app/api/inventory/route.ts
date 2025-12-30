// Inventory API - List and Create inventory items
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, createdResponse, validationError } from '@/lib/api/response'
import { validateRequiredFields } from '@/lib/api/validation'
import { requireAuth } from '@/lib/api/auth'

// Mock inventory data (replace with database later)
let inventory = [
    {
        id: '1',
        itemCode: 'ITEM-001',
        itemName: 'Product A',
        quantity: 100,
        unit: 'pcs',
        price: 50.00,
        category: 'Electronics',
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        itemCode: 'ITEM-002',
        itemName: 'Product B',
        quantity: 250,
        unit: 'pcs',
        price: 30.00,
        category: 'Accessories',
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        itemCode: 'ITEM-003',
        itemName: 'Product C',
        quantity: 75,
        unit: 'pcs',
        price: 100.00,
        category: 'Electronics',
        updatedAt: new Date().toISOString()
    }
]

/**
 * GET /api/inventory
 * Fetch all inventory items
 */
export async function GET(request: NextRequest) {
    try {
        // Get query parameters for filtering
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')

        let filteredInventory = [...inventory]

        // Filter by category
        if (category) {
            filteredInventory = filteredInventory.filter(
                item => item.category.toLowerCase() === category.toLowerCase()
            )
        }

        // Search by item name or code
        if (search) {
            const searchLower = search.toLowerCase()
            filteredInventory = filteredInventory.filter(
                item =>
                    item.itemName.toLowerCase().includes(searchLower) ||
                    item.itemCode.toLowerCase().includes(searchLower)
            )
        }

        return successResponse(filteredInventory, 'Inventory fetched successfully')
    } catch (error) {
        console.error('Error fetching inventory:', error)
        return errorResponse('Failed to fetch inventory')
    }
}

/**
 * POST /api/inventory
 * Create new inventory item
 */
export const POST = requireAuth(async (request: NextRequest, context: any, user: any) => {
    try {
        const body = await request.json()

        // Validate required fields
        const validation = validateRequiredFields(body, [
            'itemCode',
            'itemName',
            'quantity',
            'unit',
            'price'
        ])

        if (!validation.isValid) {
            return validationError(validation.errors || [])
        }

        // Check if item code already exists
        const exists = inventory.find(item => item.itemCode === body.itemCode)
        if (exists) {
            return validationError('Item code already exists')
        }

        // Create new inventory item
        const newItem = {
            id: String(inventory.length + 1),
            itemCode: body.itemCode,
            itemName: body.itemName,
            quantity: Number(body.quantity),
            unit: body.unit,
            price: Number(body.price),
            category: body.category || 'General',
            updatedAt: new Date().toISOString()
        }

        inventory.push(newItem)

        return createdResponse(newItem, 'Inventory item created successfully')
    } catch (error) {
        console.error('Error creating inventory item:', error)
        return errorResponse('Failed to create inventory item')
    }
})
