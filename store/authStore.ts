import { create } from 'zustand'

interface User {
  id: string
  name: string
  username: string
  role: 'admin' | 'user'
  isActive: boolean
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  hydrated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  initialize: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  hydrated: false,
  login: async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('aura-token', data.token)
        localStorage.setItem('aura-user', JSON.stringify(data.user))
      }

      set({
        isAuthenticated: true,
        token: data.token,
        user: data.user,
      })

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura-token')
      localStorage.removeItem('aura-user')
    }
    set({ isAuthenticated: false, token: null, user: null, hydrated: true })
  },
  initialize: async () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('aura-token')
    const userStr = localStorage.getItem('aura-user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({
          isAuthenticated: true,
          token,
          user,
        })
        // Verify token is still valid by fetching current user
        await get().fetchCurrentUser()
      } catch {
        // Invalid stored data, leave state as-is (will redirect to login)
      }
    }

    set({ hydrated: true })
  },
  fetchCurrentUser: async () => {
    try {
      const { token } = get()
      if (!token) return

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (typeof window !== 'undefined') {
          localStorage.setItem('aura-user', JSON.stringify(data.user))
        }
        set({ user: data.user })
      } else {
        // Token invalid, logout
        get().logout()
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      get().logout()
    }
  },
}))
