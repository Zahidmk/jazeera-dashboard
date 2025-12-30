// Authentication utilities for API routes
import { NextRequest, NextResponse } from 'next/server'

export interface User {
    id: string
    username: string
    email?: string
    role: 'admin' | 'manager' | 'rep'
}

export interface AuthResult {
    authenticated: boolean
    user?: User
    error?: string
}

/**
 * Check if request has valid authentication
 * For now, this is a simple implementation
 * TODO: Implement proper JWT verification when JWT library is added
 */
export async function checkAuth(request: NextRequest): Promise<AuthResult> {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
        return {
            authenticated: false,
            error: 'No authorization header provided'
        }
    }

    const token = authHeader.replace('Bearer ', '')

    if (!token) {
        return {
            authenticated: false,
            error: 'No token provided'
        }
    }

    try {
        // TODO: Implement JWT verification
        // For now, accept any token as valid for development
        // const decoded = verify(token, process.env.JWT_SECRET || 'secret')

        // Mock user for development
        const user: User = {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        }

        return {
            authenticated: true,
            user
        }
    } catch (error) {
        return {
            authenticated: false,
            error: 'Invalid token'
        }
    }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
    handler: (request: NextRequest, context: any, user: User) => Promise<NextResponse>
) {
    return async (request: NextRequest, context: any) => {
        const auth = await checkAuth(request)

        if (!auth.authenticated) {
            return NextResponse.json(
                {
                    success: false,
                    error: auth.error || 'Authentication required'
                },
                { status: 401 }
            )
        }

        return handler(request, context, auth.user!)
    }
}

/**
 * Check if user has required role
 */
export function requireRole(
    roles: User['role'][],
    handler: (request: NextRequest, context: any, user: User) => Promise<NextResponse>
) {
    return requireAuth(async (request: NextRequest, context: any, user: User) => {
        if (!roles.includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Insufficient permissions'
                },
                { status: 403 }
            )
        }

        return handler(request, context, user)
    })
}

/**
 * Generate a simple token (for development)
 * TODO: Replace with proper JWT generation
 */
export function generateToken(user: User): string {
    // Simple base64 encoding for development
    // TODO: Implement proper JWT signing
    const payload = JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    return Buffer.from(payload).toString('base64')
}

/**
 * Validate user credentials (mock implementation)
 * TODO: Replace with actual database lookup
 */
export async function validateCredentials(
    username: string,
    password: string
): Promise<User | null> {
    // Mock validation for development
    // TODO: Implement actual database validation
    if (username === 'admin' && password === 'admin') {
        return {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        }
    }

    if (username === 'manager' && password === 'manager') {
        return {
            id: '2',
            username: 'manager',
            email: 'manager@example.com',
            role: 'manager'
        }
    }

    return null
}
