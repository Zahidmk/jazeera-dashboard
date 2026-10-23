// Set NEXT_PUBLIC_API_URL in .env for any real deployment; the fallback is local dev only.
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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

  // Session no longer valid (expired, user deactivated, or account removed) → back to login.
  // The login call itself returns 401 for bad credentials, so it is excluded.
  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/api/v1/auth/login')) {
    removeToken()
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'Something went wrong')
  }

  return data as T
}

/** GET a binary file (e.g. a PDF) with the login token. Errors come back as JSON. */
export async function apiBlob(path: string): Promise<Blob> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 401 && typeof window !== 'undefined') {
    removeToken()
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    let message = 'Could not load the file'
    try {
      const data = await res.json()
      message = data?.error || data?.message || message
    } catch {
      // not JSON - keep the generic message
    }
    throw new Error(message)
  }

  return res.blob()
}
