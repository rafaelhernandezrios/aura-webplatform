import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ticket from '@/models/Ticket'
import { getAuthUser } from '@/lib/auth'

function serializeTicket(t: {
  _id: unknown
  userId: unknown
  subject: string
  messages: Array<{ body: string; fromUser: unknown; isStaff: boolean; createdAt: Date }>
  status: string
  priority: string
  assignedTo?: unknown
  createdAt: Date
  updatedAt: Date
}) {
  const userIdObj = t.userId as { _id?: string; username?: string }
  const assignedObj = t.assignedTo as { _id?: string; username?: string } | null
  return {
    id: (t._id as { toString: () => string }).toString(),
    userId: userIdObj?._id?.toString?.() ?? (userIdObj as string)?.toString?.() ?? '',
    username: userIdObj?.username,
    subject: t.subject,
    messages: (t.messages || []).map((m) => {
      const from = m.fromUser as { _id?: { toString: () => string }; username?: string } | string
      return {
        body: m.body,
        fromUser: typeof from === 'object' && from?._id ? String(from._id) : String(from ?? ''),
        fromUsername: typeof from === 'object' && from?.username ? from.username : undefined,
        isStaff: m.isStaff,
        createdAt: m.createdAt,
      }
    }),
    status: t.status,
    priority: t.priority,
    assignedTo: assignedObj?._id?.toString?.() ?? (assignedObj as string)?.toString?.() ?? null,
    assignedToUsername: assignedObj?.username ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const ticket = await Ticket.findById(id)
      .populate('userId', 'username')
      .populate('assignedTo', 'username')
      .populate('messages.fromUser', 'username')
      .lean()
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    const userIdRaw = ticket.userId as unknown as { _id?: { toString(): string } } | string | null | undefined
    const userIdStr =
      userIdRaw != null && typeof userIdRaw === 'object' && userIdRaw._id != null
        ? (typeof userIdRaw._id === 'object' && 'toString' in userIdRaw._id ? userIdRaw._id.toString() : String(userIdRaw._id))
        : typeof userIdRaw === 'string'
          ? userIdRaw
          : ''
    if (authUser.role !== 'admin' && userIdStr !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({
      ticket: serializeTicket(ticket as Parameters<typeof serializeTicket>[0]),
    })
  } catch (error: unknown) {
    console.error('Ticket get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    const body = await request.json()
    const { status, priority, assignedTo, message } = body

    if (message !== undefined) {
      const mongoose = await import('mongoose')
      ticket.messages = ticket.messages || []
      ticket.messages.push({
        body: message,
        fromUser: new mongoose.Types.ObjectId(authUser.userId) as unknown as import('mongoose').Types.ObjectId,
        isStaff: authUser.role === 'admin',
        createdAt: new Date(),
      })
    }

    if (authUser.role === 'admin') {
      if (status != null) ticket.status = status
      if (priority != null) ticket.priority = priority
      if (assignedTo != null) {
        const mongoose = await import('mongoose')
        ticket.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) as import('mongoose').Types.ObjectId : undefined
      }
    }

    await ticket.save()
    const updated = await Ticket.findById(id)
      .populate('userId', 'username')
      .populate('assignedTo', 'username')
      .lean()
    return NextResponse.json({
      ticket: serializeTicket(updated as Parameters<typeof serializeTicket>[0]),
    })
  } catch (error: unknown) {
    console.error('Ticket update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const ticket = await Ticket.findByIdAndDelete(id)
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Ticket deleted' })
  } catch (error: unknown) {
    console.error('Ticket delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
