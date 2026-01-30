'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiSettings, FiPlus, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Setting {
  id: string
  key: string
  value: string | number | boolean | object
  updatedAt: string
}

export default function AdminSettings({ token }: { token: string | null }) {
  const [list, setList] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Setting | null>(null)
  const [form, setForm] = useState({ key: '', value: '' })
  const [saving, setSaving] = useState(false)

  const fetchList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.settings || [])
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
      let value: string | number | boolean = form.value
      if (form.value === 'true') value = true
      else if (form.value === 'false') value = false
      else if (!isNaN(Number(form.value))) value = Number(form.value)
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: form.key.trim(), value }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Setting updated' : 'Setting created')
        setShowForm(false)
        setEditing(null)
        setForm({ key: '', value: '' })
        fetchList()
      } else setError(data.error || 'Failed to save')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (key: string) => {
    if (!token || !confirm(`Delete setting "${key}"?`)) return
    try {
      const res = await fetch(`/api/settings/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Setting deleted')
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
          <FiSettings className="text-electric-cyan" /> Settings
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({ key: '', value: '' })
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add Setting
          </button>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      {showForm && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Setting' : 'New Setting'}</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Key</label>
              <input
                type="text"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="input-field"
                required
                disabled={!!editing}
                placeholder="e.g. site_name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Value (string, number, or true/false)</label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="input-field"
                required
                placeholder="e.g. Aura Portal"
              />
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
          <p className="text-white/60">No settings</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Key</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Value</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-glass-surface/50">
                    <td className="py-3 px-4 font-mono text-sm">{s.key}</td>
                    <td className="py-3 px-4 text-white/80 text-sm">
                      {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value)}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(s)
                          setForm({
                            key: s.key,
                            value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value),
                          })
                          setShowForm(true)
                        }}
                        className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => remove(s.key)}
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
