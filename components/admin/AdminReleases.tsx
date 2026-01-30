'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiPackage, FiPlus, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi'

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

const PLATFORMS = ['windows', 'macos', 'linux', 'mobile', 'all'] as const

export default function AdminReleases({ token }: { token: string | null }) {
  const [list, setList] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Release | null>(null)
  const [form, setForm] = useState({
    version: '',
    fileName: '',
    platform: 'windows',
    platformLabel: 'Windows',
    size: '',
    changelog: '',
    isLatest: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/releases', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.releases || [])
      } else setError('Failed to load')
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const url = editing ? `/api/releases/${editing.id}` : '/api/releases'
      const method = editing ? 'PATCH' : 'POST'
      const body = editing
        ? { version: form.version, fileName: form.fileName, platform: form.platform, platformLabel: form.platformLabel, size: form.size, changelog: form.changelog, isLatest: form.isLatest }
        : form
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Release updated' : 'Release created')
        setShowForm(false)
        setEditing(null)
        setForm({ version: '', fileName: '', platform: 'windows', platformLabel: 'Windows', size: '', changelog: '', isLatest: false })
        fetchList()
      } else setError(data.error || 'Failed to save')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this release?')) return
    try {
      const res = await fetch(`/api/releases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Release deleted')
        fetchList()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete')
      }
    } catch {
      setError('Network error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FiPackage className="text-electric-cyan" /> Releases
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({ version: '', fileName: '', platform: 'windows', platformLabel: 'Windows', size: '', changelog: '', isLatest: false })
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add Release
          </button>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      {showForm && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Release' : 'New Release'}</h3>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Version</label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="input-field"
                  placeholder="2.1.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">File name (S3)</label>
                <input
                  type="text"
                  value={form.fileName}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  className="input-field"
                  placeholder="AuraSetup-x64-2.1.0.exe"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => {
                    const p = e.target.value as typeof PLATFORMS[number]
                    const labels: Record<string, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux', mobile: 'Mobile', all: 'All' }
                    setForm({ ...form, platform: p, platformLabel: labels[p] || p })
                  }}
                  className="input-field"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Platform label</label>
                <input
                  type="text"
                  value={form.platformLabel}
                  onChange={(e) => setForm({ ...form, platformLabel: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Size (optional)</label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="input-field"
                placeholder="45 MB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Changelog (optional)</label>
              <textarea
                value={form.changelog}
                onChange={(e) => setForm({ ...form, changelog: e.target.value })}
                className="input-field resize-none"
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isLatest}
                onChange={(e) => setForm({ ...form, isLatest: e.target.checked })}
                className="rounded"
              />
              <span className="text-white/80">Mark as latest</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card-hover p-6">
        {loading ? (
          <p className="text-white/60">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-white/60">No releases</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Version</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">File</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Platform</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Latest</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-glass-surface/50">
                    <td className="py-3 px-4">{r.version}</td>
                    <td className="py-3 px-4 text-white/60 text-sm">{r.fileName}</td>
                    <td className="py-3 px-4">{r.platformLabel}</td>
                    <td className="py-3 px-4">{r.isLatest ? <span className="text-green-400">Yes</span> : '-'}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(r)
                          setForm({
                            version: r.version,
                            fileName: r.fileName,
                            platform: r.platform,
                            platformLabel: r.platformLabel,
                            size: r.size || '',
                            changelog: r.changelog || '',
                            isLatest: r.isLatest,
                          })
                          setShowForm(true)
                        }}
                        className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="p-2 hover:bg-red-500/20 rounded text-red-400"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
