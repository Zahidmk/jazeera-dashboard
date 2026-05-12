'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiCall, setToken, removeToken, getToken } from '@/lib/api/client'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  van?: { id: string; plateNumber: string } | null
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  // Start as loading=true so dashboard waits for client hydration
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Runs only on client — reads localStorage after hydration
  useEffect(() => {
    const token = getToken()
    const savedUser = localStorage.getItem('jazeera_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        removeToken()
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiCall<{ success: boolean; data: { token: string; driver: AuthUser } }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    const userData = res.data.driver
    const token = res.data.token
    setToken(token)
    localStorage.setItem('jazeera_user', JSON.stringify(userData))
    setUser(userData)
    router.push('/dashboard')
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
