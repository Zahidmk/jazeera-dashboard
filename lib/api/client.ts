const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://glamourously-pernickety-evalyn.ngrok-free.dev'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('jazeera_token')
}

export function setToken(token: string): void {
  localStorage.setItem('jazeera_token', token)
  // Also set as cookie so Next.js middleware can read it
  document.cookie = `jazeera_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function removeToken(): void {
  localStorage.removeItem('jazeera_token')
  localStorage.removeItem('jazeera_user')
  // Clear cookie
  document.cookie = 'jazeera_token=; path=/; max-age=0'
}

export async function apiCall<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Something went wrong')
  }

  return data as T
}
