import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (typeof window !== 'undefined' 
    ? (localStorage.getItem('aura-theme') as Theme) || 'dark'
    : 'dark'),
  toggleTheme: () => {
    const newTheme = typeof window !== 'undefined' 
      ? (localStorage.getItem('aura-theme') === 'dark' ? 'light' : 'dark')
      : 'light'
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    
    set({ theme: newTheme })
  },
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
    set({ theme })
  },
}))
