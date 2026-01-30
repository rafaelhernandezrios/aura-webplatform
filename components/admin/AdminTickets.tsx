'use client'

import { useEffect, useState } from 'react'
import { FiMessageCircle, FiRefreshCw, FiEye, FiTrash2 } from 'react-icons/fi'

interface Ticket {
  id: string
  subject: string
  username?: string
  status: string
  priority: string
  messagesCount: number
  createdAt: string
}

export default function AdminTickets({ token }: { token: string | null }) {
  const [list, setList] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<{
    id: string
    subject: string
    messages: Array<{ body: string; fromUsername?: string; isStaff: boolean; createdAt: string }>
    status: string
    priority: string
  } | null>(null)
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchList = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setList(data.tickets || [])
      } else setError('Failed to load')
    } catch {
      setError('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const fetchDetail = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setDetail(data.ticket)
        setDetailId(id)
        setStatus(data.ticket.status)
      }
    } catch {
      setError('Failed to load ticket')
    }
  }

  useEffect(() => {
    fetchList()
  }, [token])

  const sendReply = async () => {
    if (!token || !detailId || !reply.trim()) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const body: { message: string; status?: string } = { message: reply.trim() }
      if (status && status !== detail?.status) body.status = status
      const res = await fetch(`/api/tickets/${detailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Reply sent')
        setReply('')
        setDetail(data.ticket)
        fetchList()
      } else setError(data.error || 'Failed to send')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (ticketId: string, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setSuccess('Status updated')
        if (detailId === ticketId) setDetail((d) => d ? { ...d, status: newStatus } : null)
        fetchList()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update')
      }
    } catch {
      setError('Network error')
    }
  }

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this ticket?')) return
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSuccess('Ticket deleted')
        if (detailId === id) { setDetailId(null); setDetail(null) }
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
          <FiMessageCircle className="text-electric-cyan" /> Tickets
        </h2>
        <button onClick={fetchList} className="btn-secondary flex items-center gap-2">
          <FiRefreshCw /> Refresh
        </button>
      </div>
      {error && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>}
      {success && <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card-hover p-6">
          {loading ? (
            <p className="text-white/60">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-white/60">No tickets</p>
          ) : (
            <div className="space-y-3">
              {list.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-glass-surface rounded-lg hover:bg-glass-surface/80">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{t.subject}</h4>
                    <p className="text-sm text-white/60">{t.username} · {t.status} · {t.priority} · {t.messagesCount} msg</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => fetchDetail(t.id)}
                      className="p-2 hover:bg-electric-cyan/20 rounded text-electric-cyan"
                      title="View"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card-hover p-6">
          {detail ? (
            <>
              <h3 className="text-lg font-semibold mb-2">{detail.subject}</h3>
              <p className="text-sm text-white/60 mb-4">Status: {detail.status} · Priority: {detail.priority}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-white/80">Change status</label>
                <div className="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="open">open</option>
                    <option value="in-progress">in-progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => detailId && updateStatus(detailId, status)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Update status
                  </button>
                </div>
              </div>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {detail.messages?.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${m.isStaff ? 'bg-neon-violet/20' : 'bg-glass-surface'}`}>
                    <span className="text-white/50 text-xs">{m.fromUsername || 'User'} · {m.isStaff ? 'Staff' : ''}</span>
                    <p className="mt-1">{m.body}</p>
                    <span className="text-xs text-white/40">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="input-field resize-none mb-2"
                  rows={3}
                  placeholder="Type your reply..."
                />
                <button
                  onClick={sendReply}
                  disabled={saving || !reply.trim()}
                  className="btn-primary w-full"
                >
                  {saving ? 'Sending...' : 'Send reply'}
                </button>
              </div>
              <button onClick={() => { setDetailId(null); setDetail(null); setReply('') }} className="btn-secondary w-full mt-3">
                Close
              </button>
            </>
          ) : (
            <p className="text-white/50 text-sm">Select a ticket to view and reply</p>
          )}
        </div>
      </div>
    </div>
  )
}
