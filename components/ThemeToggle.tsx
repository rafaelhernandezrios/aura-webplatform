'use client'

import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useThemeStore } from '@/store/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply theme on mount
    const savedTheme = localStorage.getItem('aura-theme') || 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
    useThemeStore.setState({ theme: savedTheme as 'dark' | 'light' })
  }, [])

  useEffect(() => {
    if (mounted) {
      // Update theme when it changes
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme, mounted])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
        <div className="w-5 h-5 bg-glass-surface rounded animate-pulse" />
        <div className="w-20 h-4 bg-glass-surface rounded animate-pulse" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-glass-surface"
      style={{
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#00F2FF'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <FiSun className="text-lg" />
          <span className="text-sm">Light Mode</span>
        </>
      ) : (
        <>
          <FiMoon className="text-lg" />
          <span className="text-sm">Dark Mode</span>
        </>
      )}
    </button>
  )
}
