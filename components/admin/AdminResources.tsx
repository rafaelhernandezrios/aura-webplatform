'use client'

import { useEffect, useState } from 'react'
import { FiBook, FiPlus, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Resource {
  id: string
  title: string
  description: string
  type: string
  url?: string
  duration?: string
  size?: string
  level?: string
  order: number
  visible: boolean
  createdAt: string
}

const TYPES = ['video', 'pdf', 'link'] as const
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export default function AdminResources({ token }: { token: string | null }) {
  const [list, setList] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'link',
    url: '',
    duration: '',
    size: '',
    level: '',
    order: 0,
    visible: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchList = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/resources?visible=false', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.resources || [])
      } else setError('Failed to load')
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [token])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const url = editing ? `/api/resources/${editing.id}` : '/api/resources'
      const method = editing ? 'PATCH' : 'POST'
      const body = {
        title: form.title,
        description: form.description,
        type: form.type,
        url: form.url || undefined,
        duration: form.duration || undefined,
        size: form.size || undefined,
        level: form.level || undefined,
        order: form.order,
        visible: form.visible,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Resource updated' : 'Resource created')
        setShowForm(false)
        setEditing(null)
        setForm({ title: '', description: '', type: 'link', url: '', duration: '', size: '', level: '', order: 0, visible: true })
        fetchList()
      } else setError(data.error || 'Failed to save')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this resource?')) return
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Resource deleted')
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
          <FiBook className="text-electric-cyan" /> Resources (Learning)
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({ title: '', description: '', type: 'link', url: '', duration: '', size: '', level: '', order: 0, visible: true })
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add Resource
          </button>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      {showForm && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Resource' : 'New Resource'}</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof TYPES[number] })}
                  className="input-field"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Level (optional)</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="input-field"
                >
                  <option value="">—</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">URL (optional)</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Duration (e.g. 45 min)</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Size (e.g. 2.4 MB)</label>
                <input
                  type="text"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input-field w-20" />
                <span className="text-white/80">Order</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="rounded" />
                <span className="text-white/80">Visible</span>
              </label>
            </div>
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
          <p className="text-white/60">No resources</p>
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-glass-surface rounded-lg">
                <div>
                  <h4 className="font-semibold">{r.title}</h4>
                  <p className="text-sm text-white/60 line-clamp-1">{r.description}</p>
                  <span className="text-xs text-white/50">{r.type} {r.level ? `· ${r.level}` : ''} · {r.visible ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(r)
                      setForm({
                        title: r.title,
                        description: r.description,
                        type: r.type,
                        url: r.url || '',
                        duration: r.duration || '',
                        size: r.size || '',
                        level: r.level || '',
                        order: r.order,
                        visible: r.visible,
                      })
                      setShowForm(true)
                    }}
                    className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button onClick={() => remove(r.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" title="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
