'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiDownload,
  FiCode,
  FiBook,
  FiHeadphones,
  FiUsers,
  FiUser,
  FiLogOut,
} from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { useAppConfigStore } from '@/store/appConfigStore'
import ThemeToggle from './ThemeToggle'

const menuItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiDownload, label: 'Software Center', path: '/software' },
  { icon: FiCode, label: 'Developer Hub', path: '/developer' },
  { icon: FiBook, label: 'Learning Center', path: '/learning' },
  { icon: FiHeadphones, label: 'Support', path: '/support', badge: true },
  { icon: FiUser, label: 'Profile', path: '/profile' },
  { icon: FiUsers, label: 'User Management', path: '/admin', role: 'admin' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user, initialize, token } = useAuthStore()
  const siteName = useAppConfigStore((s) => s.siteName)
  const [openTicketsCount, setOpenTicketsCount] = useState(0)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!token) return
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          const tickets = data.tickets || []
          const open = tickets.filter((t: { status: string }) => t.status === 'open' || t.status === 'in-progress').length
          setOpenTicketsCount(open)
        }
      } catch {
        // ignore
      }
    }
    fetchTickets()
  }, [token])

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 glass-card border-r p-6 flex flex-col z-40"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <div className="mb-6 flex flex-col items-center">
        <Image
          src="/aura-logo.png"
          alt="Aura Logo"
          width={100}
          height={100}
          className="object-contain"
        />
        {siteName && (
          <p className="text-sm text-white/60 mt-2 text-center font-medium">{siteName}</p>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems
          .filter((item) => {
            if (!item.role) return true
            return user?.role === item.role
          })
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            const showBadge = 'badge' in item && item.badge && openTicketsCount > 0
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${isActive ? 'sidebar-link-active' : 'sidebar-link'} relative flex items-center justify-between`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </span>
                {showBadge && (
                  <span className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center text-xs font-semibold rounded-full bg-electric-cyan text-deep-space">
                    {openTicketsCount > 99 ? '99+' : openTicketsCount}
                  </span>
                )}
              </Link>
            )
          })}
      </nav>

      <div 
        className="pt-4 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="mb-4">
          <ThemeToggle />
        </div>
        {user && (
          <div className="px-4 py-2 mb-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {user.username}
            </p>
            {user.role === 'admin' && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-neon-violet/20 text-neon-violet rounded">
                ADMIN
              </span>
            )}
            {user.role === 'user' && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-electric-cyan/20 text-electric-cyan rounded">
                USER
              </span>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full sidebar-link text-red-400 hover:text-red-300"
        >
          <FiLogOut className="text-xl" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
