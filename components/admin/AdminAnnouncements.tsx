'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiBell, FiPlus, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Announcement {
  id: string
  title: string
  body: string
  type: string
  active: boolean
  startAt?: string | null
  endAt?: string | null
  createdAt: string
}

const TYPES = ['news', 'info', 'warning', 'maintenance'] as const

export default function AdminAnnouncements({ token }: { token: string | null }) {
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'news',
    active: true,
    startAt: '',
    endAt: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/announcements?active=false', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.announcements || [])
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
      const url = editing ? `/api/announcements/${editing.id}` : '/api/announcements'
      const method = editing ? 'PATCH' : 'POST'
      const body = {
        title: form.title,
        body: form.body,
        type: form.type,
        active: form.active,
        startAt: form.startAt || undefined,
        endAt: form.endAt || undefined,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Announcement updated' : 'Announcement created')
        setShowForm(false)
        setEditing(null)
        setForm({ title: '', body: '', type: 'news', active: true, startAt: '', endAt: '' })
        fetchList()
      } else setError(data.error || 'Failed to save')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Announcement deleted')
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
          <FiBell className="text-electric-cyan" /> Announcements
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({ title: '', body: '', type: 'news', active: true, startAt: '', endAt: '' })
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add Announcement
          </button>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      {showForm && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
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
              <label className="block text-sm font-medium mb-2 text-white/80">Body</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="input-field resize-none"
                rows={4}
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
              <label className="flex items-center gap-2 self-end">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
                <span className="text-white/80">Active</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Start (optional)</label>
                <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">End (optional)</label>
                <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="input-field" />
              </div>
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
          <p className="text-white/60">No announcements</p>
        ) : (
          <div className="space-y-3">
            {list.map((a) => (
              <div key={a.id} className="flex items-start justify-between p-4 bg-glass-surface rounded-lg">
                <div>
                  <h4 className="font-semibold">{a.title}</h4>
                  <p className="text-sm text-white/60 line-clamp-2">{a.body}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${a.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>
                    {a.type} · {a.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(a)
                      setForm({
                        title: a.title,
                        body: a.body,
                        type: a.type,
                        active: a.active,
                        startAt: a.startAt ? new Date(a.startAt).toISOString().slice(0, 16) : '',
                        endAt: a.endAt ? new Date(a.endAt).toISOString().slice(0, 16) : '',
                      })
                      setShowForm(true)
                    }}
                    className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button onClick={() => remove(a.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" title="Delete">
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
