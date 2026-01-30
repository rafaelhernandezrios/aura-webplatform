'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import { useDeviceStore } from '@/store/deviceStore'
import { FiDownload, FiLoader } from 'react-icons/fi'

interface Release {
  id: string
  version: string
  fileName: string
  platformLabel: string
  size?: string
  isLatest: boolean
}

interface Announcement {
  id: string
  title: string
  body: string
  type: string
  createdAt: string
}

interface MyDevice {
  id: string
  serialNumber: string
  model: string
  firmwareVersion: string
  status: string
  lastSeen?: string | null
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user, hydrated, initialize, token } = useAuthStore()
  const { deviceVersion, firmwareVersion, checkConnection } = useDeviceStore()
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [latestRelease, setLatestRelease] = useState<Release | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [myDevices, setMyDevices] = useState<MyDevice[]>([])

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      checkConnection()
    }
  }, [hydrated, isAuthenticated, router, checkConnection])

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchData = async () => {
      try {
        const [releasesRes, announcementsRes, devicesRes] = await Promise.all([
          fetch('/api/releases?latest=true'),
          fetch('/api/announcements'),
          token ? fetch('/api/devices/me', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
        ])
        if (releasesRes.ok) {
          const data = await releasesRes.json()
          const releases = data.releases || []
          if (releases.length > 0) setLatestRelease(releases[0])
        }
        if (announcementsRes.ok) {
          const data = await announcementsRes.json()
          setAnnouncements(data.announcements || [])
        }
        if (devicesRes?.ok) {
          const data = await devicesRes.json()
          setMyDevices(data.devices || [])
        }
      } catch (e) {
        console.error('Dashboard fetch:', e)
      }
    }
    fetchData()
  }, [isAuthenticated, token])

  const displayVersion = latestRelease?.version || firmwareVersion
  const displayFileName = latestRelease?.fileName
  const hasDownloadableRelease = !!latestRelease
  const firstDevice = myDevices[0]
  const showDeviceDemo = !firstDevice

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      setDownloadError('Authentication required. Please log in again.')
      return
    }

    if (!displayVersion) {
      setDownloadError('Version information not available')
      return
    }

    setDownloading(true)
    setDownloadError('')

    try {
      let url = `/api/download?version=${encodeURIComponent(displayVersion)}`
      if (displayFileName) url += `&fileName=${encodeURIComponent(displayFileName)}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download URL')
      }

      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = data.fileName || `aura-software-v${displayVersion}.exe`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => setDownloadError(''), 3000)
    } catch (error: unknown) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to start download. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (!hydrated || !isAuthenticated) return null

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-white/60">Manage your Aura hardware from here</p>
        </div>

        {/* Hero Section - Download Latest Software (only when admin has added a release) */}
        {hasDownloadableRelease ? (
          <div className="glass-card-hover p-8 mb-8 neural-glow relative">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">
                  Latest Software Available
                </h2>
                <p className="text-white/60 mb-4">
                  Version {displayVersion} - Update with performance improvements
                </p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>Device: {firstDevice?.model ?? deviceVersion}</span>
                  <span>•</span>
                  <span>{firstDevice?.lastSeen ? `Last seen: ${new Date(firstDevice.lastSeen).toLocaleDateString()}` : 'Last update: 2 days ago'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 relative z-10">
                <button 
                  onClick={handleDownload}
                  disabled={downloading || !token || !displayVersion}
                  className="btn-primary flex items-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                  type="button"
                >
                  {downloading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload />
                      Download v{displayVersion}
                    </>
                  )}
                </button>
                {downloadError && (
                  <p className="text-sm text-red-400 text-right max-w-xs">{downloadError}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card-hover p-8 mb-8 relative">
            <h2 className="text-2xl font-display font-semibold mb-2">Software</h2>
            <p className="text-white/60">No software version available at the moment. Check the Software Center later.</p>
          </div>
        )}

        {/* Device Information: from API (my devices) or demo placeholder */}
        <div className="glass-card-hover p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Device Information
            {showDeviceDemo && (
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/50">Demo data</span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-glass-surface rounded-lg">
              <div>
                <p className="text-sm text-white/60">Serial Number</p>
                <p className="font-semibold">{firstDevice?.serialNumber ?? deviceVersion}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-glass-surface rounded-lg">
              <div>
                <p className="text-sm text-white/60">Firmware Version</p>
                <p className="font-semibold">v{firstDevice?.firmwareVersion ?? displayVersion}</p>
              </div>
            </div>
            {firstDevice && (
              <div className="flex items-center gap-4 p-4 bg-glass-surface rounded-lg">
                <div>
                  <p className="text-sm text-white/60">Status</p>
                  <p className="font-semibold capitalize">{firstDevice.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="glass-card-hover p-6 cursor-pointer"
            onClick={() => router.push('/software')}
          >
            <h3 className="text-lg font-semibold mb-2">Software Center</h3>
            <p className="text-sm text-white/60 mb-4">
              Access all available installers
            </p>
            <span className="text-electric-cyan text-sm font-medium">
              Explore →
            </span>
          </div>

          <div
            className="glass-card-hover p-6 cursor-pointer"
            onClick={() => router.push('/developer')}
          >
            <h3 className="text-lg font-semibold mb-2">Developer Hub</h3>
            <p className="text-sm text-white/60 mb-4">
              Manage your API Keys and documentation
            </p>
            <span className="text-electric-cyan text-sm font-medium">
              Access →
            </span>
          </div>

          <div
            className="glass-card-hover p-6 cursor-pointer"
            onClick={() => router.push('/learning')}
          >
            <h3 className="text-lg font-semibold mb-2">Learning Center</h3>
            <p className="text-sm text-white/60 mb-4">
              Masterclasses and technical guides
            </p>
            <span className="text-electric-cyan text-sm font-medium">
              Learn →
            </span>
          </div>
        </div>

        {/* Recent News / Announcements (styled by type) */}
        <div className="glass-card-hover p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Recent News</h3>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="p-4 bg-glass-surface rounded-lg">
                <p className="text-sm text-white/60">No announcements at the moment.</p>
              </div>
            ) : (
              announcements.slice(0, 5).map((a) => {
                const typeStyles: Record<string, string> = {
                  news: 'border-l-4 border-electric-cyan bg-glass-surface',
                  info: 'border-l-4 border-blue-400 bg-blue-500/10',
                  warning: 'border-l-4 border-yellow-400 bg-yellow-500/10',
                  maintenance: 'border-l-4 border-orange-400 bg-orange-500/10',
                }
                const style = typeStyles[a.type] || typeStyles.news
                return (
                  <div key={a.id} className={`p-4 rounded-lg ${style}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{a.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 capitalize">{a.type}</span>
                    </div>
                    <p className="text-sm text-white/60">{a.body}</p>
                    <span className="text-xs text-electric-cyan mt-2 inline-block">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
