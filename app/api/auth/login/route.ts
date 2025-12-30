// Authentication API - User login
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validationError } from '@/lib/api/response'
import { validateCredentials, generateToken } from '@/lib/api/auth'

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        // Validate input
        if (!username || !password) {
            return validationError('Username and password are required')
        }

        // Validate credentials
        const user = await validateCredentials(username, password)

        if (!user) {
            return errorResponse('Invalid username or password', null, 401)
        }

        // Generate token
        const token = generateToken(user)

        return successResponse(
            {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            },
            'Login successful'
        )
    } catch (error) {
        console.error('Error during login:', error)
        return errorResponse('Login failed')
    }
}
