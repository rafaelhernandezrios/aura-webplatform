'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiMessageCircle, FiPackage, FiBell, FiCpu, FiBook, FiRefreshCw } from 'react-icons/fi'

interface Analytics {
  users: { total: number; active: number }
  tickets: {
    total: number
    open: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
  }
  releases: { total: number }
  announcements: { total: number; active: number }
  devices: { total: number }
  resources: { total: number }
}

export default function AdminAnalytics({ token }: { token: string | null }) {
  const [data, setData] = useState<{ analytics: Analytics } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [token])

  if (loading) {
    return (
      <div className="glass-card-hover p-8 text-center">
        <p className="text-white/60">Loading analytics...</p>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="glass-card-hover p-8 text-center">
        <p className="text-red-400">{error || 'No data'}</p>
        <button onClick={fetchAnalytics} className="btn-secondary mt-4 flex items-center gap-2 mx-auto">
          <FiRefreshCw /> Retry
        </button>
      </div>
    )
  }

  const a = data.analytics
  const cards = [
    { label: 'Users', sub: `${a.users.active} active`, value: a.users.total, icon: FiUsers, color: 'electric-cyan' },
    { label: 'Tickets', sub: `${a.tickets.open} open`, value: a.tickets.total, icon: FiMessageCircle, color: 'neon-violet' },
    { label: 'Releases', sub: '', value: a.releases.total, icon: FiPackage, color: 'electric-cyan' },
    { label: 'Announcements', sub: `${a.announcements.active} active`, value: a.announcements.total, icon: FiBell, color: 'neon-violet' },
    { label: 'Devices', sub: '', value: a.devices.total, icon: FiCpu, color: 'electric-cyan' },
    { label: 'Resources', sub: '', value: a.resources.total, icon: FiBook, color: 'neon-violet' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <button onClick={fetchAnalytics} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass-card-hover p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">{c.label}</span>
                <Icon className="text-2xl text-electric-cyan" />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              {c.sub && <p className="text-sm text-white/50">{c.sub}</p>}
            </div>
          )
        })}
      </div>
      <div className="glass-card-hover p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Tickets by Status</h3>
          <ul className="space-y-1 text-sm text-white/80">
            {Object.entries(a.tickets.byStatus).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
            {Object.keys(a.tickets.byStatus).length === 0 && <li className="text-white/50">No data</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Tickets by Priority</h3>
          <ul className="space-y-1 text-sm text-white/80">
            {Object.entries(a.tickets.byPriority).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
            {Object.keys(a.tickets.byPriority).length === 0 && <li className="text-white/50">No data</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
