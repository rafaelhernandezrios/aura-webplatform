'use client'

import { useCallback, useEffect, useState } from 'react'
import { FiCpu, FiPlus, FiRefreshCw, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface Device {
  id: string
  serialNumber: string
  model: string
  firmwareVersion: string
  status: string
  lastSeen?: string | null
  createdAt: string
}

export default function AdminDevices({ token }: { token: string | null }) {
  const [list, setList] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Device | null>(null)
  const [form, setForm] = useState({
    serialNumber: '',
    model: 'Aura Pro v2.1',
    firmwareVersion: '2.1.0',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)

  const fetchList = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/devices', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.devices || [])
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
      const url = editing ? `/api/devices/${editing.id}` : '/api/devices'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Device updated' : 'Device created')
        setShowForm(false)
        setEditing(null)
        setForm({ serialNumber: '', model: 'Aura Pro v2.1', firmwareVersion: '2.1.0', status: 'active' })
        fetchList()
      } else setError(data.error || 'Failed to save')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this device?')) return
    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Device deleted')
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
          <FiCpu className="text-electric-cyan" /> Devices
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setForm({ serialNumber: '', model: 'Aura Pro v2.1', firmwareVersion: '2.1.0', status: 'active' })
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Add Device
          </button>
        </div>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      {showForm && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Device' : 'New Device'}</h3>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Serial Number</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="input-field"
                required
                disabled={!!editing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Firmware Version</label>
                <input
                  type="text"
                  value={form.firmwareVersion}
                  onChange={(e) => setForm({ ...form, firmwareVersion: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="blocked">blocked</option>
              </select>
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
          <p className="text-white/60">No devices</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Serial</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Model</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Firmware</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-glass-surface/50">
                    <td className="py-3 px-4">{d.serialNumber}</td>
                    <td className="py-3 px-4">{d.model}</td>
                    <td className="py-3 px-4">{d.firmwareVersion}</td>
                    <td className="py-3 px-4">{d.status}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(d)
                          setForm({
                            serialNumber: d.serialNumber,
                            model: d.model,
                            firmwareVersion: d.firmwareVersion,
                            status: d.status,
                          })
                          setShowForm(true)
                        }}
                        className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button onClick={() => remove(d.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" title="Delete">
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
