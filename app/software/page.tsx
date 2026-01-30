'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import { FiDownload, FiMonitor, FiSmartphone, FiPackage, FiLoader } from 'react-icons/fi'

interface Release {
  id: string
  version: string
  fileName: string
  platform: string
  platformLabel: string
  size?: string
  changelog?: string
  isLatest: boolean
  createdAt: string
}

const platformIcons: Record<string, typeof FiMonitor> = {
  windows: FiMonitor,
  macos: FiMonitor,
  linux: FiMonitor,
  mobile: FiSmartphone,
  all: FiPackage,
}

export default function SoftwarePage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, initialize, token } = useAuthStore()
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [hydrated, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchReleases = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/releases')
        if (res.ok) {
          const data = await res.json()
          setReleases(data.releases || [])
        }
      } catch (e) {
        console.error('Releases fetch:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchReleases()
  }, [isAuthenticated])

  const handleDownload = async (r: Release) => {
    if (!token) {
      setDownloadError('Please log in again.')
      return
    }
    setDownloadingId(r.id)
    setDownloadError('')
    try {
      let url = `/api/download?version=${encodeURIComponent(r.version)}`
      if (r.fileName) url += `&fileName=${encodeURIComponent(r.fileName)}`
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate download URL')
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = data.fileName || `aura-v${r.version}.exe`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredReleases =
    selectedPlatform === 'all'
      ? releases
      : releases.filter((r) => r.platform === selectedPlatform || r.platform === 'all')

  if (!hydrated || !isAuthenticated) return null

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Software <span className="text-gradient">Center</span>
          </h1>
          <p className="text-white/60">
            Repository of installers organized by platform (from database)
          </p>
        </div>

        {downloadError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {downloadError}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'all', label: 'All', icon: FiPackage },
            { id: 'windows', label: 'Windows', icon: FiMonitor },
            { id: 'macos', label: 'macOS', icon: FiMonitor },
            { id: 'linux', label: 'Linux', icon: FiMonitor },
            { id: 'mobile', label: 'Mobile', icon: FiSmartphone },
          ].map((os) => {
            const Icon = os.icon
            return (
              <button
                key={os.id}
                onClick={() => setSelectedPlatform(os.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedPlatform === os.id
                    ? 'bg-electric-cyan text-deep-space font-semibold'
                    : 'glass-card-hover'
                }`}
              >
                <Icon />
                <span>{os.label}</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="glass-card-hover p-12 text-center">
            <FiLoader className="animate-spin text-4xl text-electric-cyan mx-auto mb-4" />
            <p className="text-white/60">Loading releases...</p>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="text-center py-12 glass-card-hover">
            <p className="text-white/60">No software available at the moment for this platform. Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReleases.map((r) => {
              const Icon = platformIcons[r.platform] || FiPackage
              return (
                <div key={r.id} className="glass-card-hover p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-electric-cyan/20 rounded-lg">
                      <Icon className="text-2xl text-electric-cyan" />
                    </div>
                    <span className="px-2 py-1 text-xs bg-neon-violet/20 text-neon-violet rounded">
                      {r.platformLabel}
                      {r.isLatest && ' · Latest'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aura Control Panel</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Version {r.version}. {r.changelog ? r.changelog.slice(0, 80) + (r.changelog.length > 80 ? '…' : '') : ''}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-white/40">Version</p>
                      <p className="text-sm font-medium">v{r.version}</p>
                    </div>
                    {r.size && (
                      <div className="text-right">
                        <p className="text-xs text-white/40">Size</p>
                        <p className="text-sm font-medium">{r.size}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(r)}
                    disabled={!!downloadingId || !token}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloadingId === r.id ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiDownload />
                        Download
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
