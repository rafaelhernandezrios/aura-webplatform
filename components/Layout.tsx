'use client'

import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import NeuralBackground from './NeuralBackground'
import { useThemeStore } from '@/store/themeStore'
import { useAppConfigStore } from '@/store/appConfigStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)
  const [mounted, setMounted] = useState(false)
  const { maintenanceMode, fetchConfig } = useAppConfigStore()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return (
    <div className="flex min-h-screen relative">
      {mounted && <NeuralBackground theme={theme} />}
      {maintenanceMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-space/95 backdrop-blur-sm">
          <div className="glass-card-hover p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2">Maintenance</h2>
            <p className="text-white/70">The portal is temporarily under maintenance. Please try again later.</p>
          </div>
        </div>
      )}
      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
