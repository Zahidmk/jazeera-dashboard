// Validation utilities for API routes

export interface StockItem {
    itemCode: string
    itemName: string
    quantity: number
    weight?: number
    unit?: string
}

export interface ValidationResult {
    isValid: boolean
    errors?: string[]
    error?: string
}

/**
 * Validate stock quantities
 */
export function validateQuantities(items: StockItem[]): ValidationResult {
    const errors: string[] = []

    if (!items || items.length === 0) {
        return {
            isValid: false,
            errors: ['No items provided']
        }
    }

    for (const item of items) {
        // Check if quantity exists and is positive
        if (!item.quantity || item.quantity <= 0) {
            errors.push(`Invalid quantity for item ${item.itemCode}: ${item.quantity}`)
        }

        // Check if quantity is a valid number
        if (isNaN(item.quantity)) {
            errors.push(`Quantity must be a number for item ${item.itemCode}`)
        }

        // Check for required fields
        if (!item.itemCode) {
            errors.push('Item code is required')
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    }
}

/**
 * Validate van capacity
 */
export function validateVanCapacity(
    vanCapacity: number,
    currentLoad: number,
    items: StockItem[]
): ValidationResult {
    // Calculate total weight of new items
    const totalWeight = items.reduce((sum, item) => {
        const weight = item.weight || 0
        return sum + (weight * item.quantity)
    }, 0)

    const newTotalLoad = currentLoad + totalWeight

    if (newTotalLoad > vanCapacity) {
        return {
            isValid: false,
            error: `Total weight ${newTotalLoad.toFixed(2)}kg exceeds van capacity ${vanCapacity}kg (current: ${currentLoad}kg, adding: ${totalWeight.toFixed(2)}kg)`
        }
    }

    return { isValid: true }
}

/**
 * Validate stock availability
 */
export function validateStockAvailability(
    requestedItems: StockItem[],
    availableInventory: Map<string, number>
): ValidationResult {
    const errors: string[] = []

    for (const item of requestedItems) {
        const available = availableInventory.get(item.itemCode) || 0

        if (item.quantity > available) {
            errors.push(
                `Insufficient stock for ${item.itemCode}: requested ${item.quantity}, available ${available}`
            )
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    }
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
): ValidationResult {
    const errors: string[] = []

    for (const field of requiredFields) {
        if (!data[field]) {
            errors.push(`${String(field)} is required`)
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    }
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/['"]/g, '') // Remove quotes
        .trim()
}
