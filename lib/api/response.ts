// Standard API response helpers
import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    details?: any
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

/**
 * Success response
 */
export function successResponse<T>(
    data: T,
    message?: string,
    status: number = 200
): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
            message
        } as ApiResponse<T>,
        { status }
    )
}

/**
 * Error response
 */
export function errorResponse(
    error: string,
    details?: any,
    status: number = 500
): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error,
            details
        } as ApiResponse,
        { status }
    )
}

/**
 * Validation error response
 */
export function validationError(
    errors: string[] | string,
    status: number = 400
): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: 'Validation failed',
            details: Array.isArray(errors) ? errors : [errors]
        } as ApiResponse,
        { status }
    )
}

/**
 * Not found response
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: `${resource} not found`
        } as ApiResponse,
        { status: 404 }
    )
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message?: string): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: message || 'Authentication required'
        } as ApiResponse,
        { status: 401 }
    )
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message?: string): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: message || 'Insufficient permissions'
        } as ApiResponse,
        { status: 403 }
    )
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        } as PaginatedResponse<T>,
        { status: 200 }
    )
}

/**
 * Created response
 */
export function createdResponse<T>(
    data: T,
    message?: string
): NextResponse {
    return NextResponse.json(
        {
            success: true,
            data,
            message: message || 'Resource created successfully'
        } as ApiResponse<T>,
        { status: 201 }
    )
}

/**
 * No content response
 */
export function noContentResponse(): NextResponse {
    return new NextResponse(null, { status: 204 })
}
