'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import { FiMessageCircle, FiSend, FiClock, FiCheckCircle, FiAlertCircle, FiHeadphones } from 'react-icons/fi'

interface TicketListItem {
  id: string
  subject: string
  status: string
  priority: string
  messagesCount: number
  createdAt: string
  updatedAt?: string
}

interface TicketDetail {
  id: string
  subject: string
  status: string
  priority: string
  messages: Array<{
    body: string
    fromUser: string
    fromUsername?: string
    isStaff: boolean
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

export default function SupportPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, user, initialize, token } = useAuthStore()
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketMessage, setNewTicketMessage] = useState('')
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [creating, setCreating] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TicketDetail | null>(null)
  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.push('/login')
  }, [hydrated, isAuthenticated, router])

  const fetchTickets = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/tickets', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      } else setError('Failed to load tickets')
    } catch {
      setError('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) fetchTickets()
  }, [isAuthenticated, token])

  const fetchDetail = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setDetail(data.ticket)
        setDetailId(id)
        setReply('')
      } else setError('Failed to load ticket')
    } catch {
      setError('Failed to load ticket')
    }
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newTicketSubject.trim() || !newTicketMessage.trim()) return
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: newTicketSubject.trim(),
          message: newTicketMessage.trim(),
          priority: newTicketPriority,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Ticket created successfully')
        setNewTicketSubject('')
        setNewTicketMessage('')
        setShowNewTicket(false)
        fetchTickets()
      } else setError(data.error || 'Failed to create ticket')
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  const sendReply = async () => {
    if (!token || !detailId || !reply.trim()) return
    setSendingReply(true)
    setError('')
    try {
      const res = await fetch(`/api/tickets/${detailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: reply.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setDetail(data.ticket)
        setReply('')
        fetchTickets()
      } else setError(data.error || 'Failed to send reply')
    } catch {
      setError('Network error')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FiAlertCircle className="text-yellow-400" />
      case 'in-progress':
        return <FiClock className="text-electric-cyan" />
      case 'resolved':
      case 'closed':
        return <FiCheckCircle className="text-green-400" />
      default:
        return <FiAlertCircle className="text-white/60" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open'
      case 'in-progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-white/60'
    }
  }

  if (!hydrated || !isAuthenticated) return null

  const isPro = user?.role === 'user'

  return (
    <Layout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Technical <span className="text-gradient">Support</span>
            </h1>
            <p className="text-white/60">
              {isPro ? 'Live chat and ticket system' : 'Support ticket system'}
            </p>
          </div>
          {isPro && (
            <span className="text-sm text-white/50 flex items-center gap-2">
              <FiHeadphones />
              Live Chat (coming soon)
            </span>
          )}
        </div>

        {!isPro && (
          <div className="glass-card-hover p-4 mb-6 bg-neon-violet/20 border-neon-violet/50">
            <p className="text-sm text-white/80">
              💡 Upgrade to Pro to access live chat with priority technical support
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>
        )}

        {showNewTicket && (
          <div className="glass-card-hover p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
            <form onSubmit={createTicket} className="space-y-4">
              <input
                type="text"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Ticket subject"
                className="input-field"
                required
              />
              <textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Describe your problem or inquiry..."
                rows={5}
                className="input-field resize-none"
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Priority</label>
                <select
                  value={newTicketPriority}
                  onChange={(e) => setNewTicketPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="input-field w-40"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : 'Create Ticket'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTicket(false)
                    setNewTicketSubject('')
                    setNewTicketMessage('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showNewTicket && (
          <button
            onClick={() => setShowNewTicket(true)}
            className="btn-primary mb-8 flex items-center gap-2"
          >
            <FiMessageCircle />
            Create New Ticket
          </button>
        )}

        {detail ? (
          <div className="glass-card-hover p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{detail.subject}</h2>
              <button onClick={() => { setDetailId(null); setDetail(null) }} className="btn-secondary text-sm">
                Close
              </button>
            </div>
            <p className="text-sm text-white/60 mb-4">
              Status: {getStatusLabel(detail.status)} · Priority: {detail.priority}
            </p>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {detail.messages?.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${m.isStaff ? 'bg-neon-violet/20' : 'bg-glass-surface'}`}
                >
                  <span className="text-white/50 text-xs">{m.fromUsername || 'User'} {m.isStaff && '(Staff)'}</span>
                  <p className="mt-1">{m.body}</p>
                  <span className="text-xs text-white/40">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
            {(detail.status === 'open' || detail.status === 'in-progress') && (
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
                  disabled={sendingReply || !reply.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiSend />
                  {sendingReply ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            )}
          </div>
        ) : null}

        <div className="space-y-4">
          {loading ? (
            <p className="text-white/60">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 glass-card-hover">
              <FiMessageCircle className="text-4xl text-white/40 mx-auto mb-4" />
              <p className="text-white/60">You have no support tickets</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="glass-card-hover p-6 cursor-pointer hover:border-electric-cyan/50 transition-all"
                onClick={() => fetchDetail(ticket.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)} bg-glass-surface`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>Status: {getStatusLabel(ticket.status)}</span>
                      <span>•</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{ticket.messagesCount} message(s)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fetchDetail(ticket.id) }}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
