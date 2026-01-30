import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Ticket from '@/models/Ticket'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const query: Record<string, unknown> =
      authUser.role === 'admin' ? {} : { userId: authUser.userId }
    if (status) query.status = status

    const tickets = await Ticket.find(query)
      .populate('userId', 'username')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 })

    const list = tickets.map((t) => ({
      id: t._id.toString(),
      userId: t.userId?._id?.toString?.() ?? t.userId?.toString?.() ?? '',
      username: (t.userId as { username?: string })?.username,
      subject: t.subject,
      messagesCount: t.messages?.length ?? 0,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo?._id?.toString?.() ?? t.assignedTo?.toString?.() ?? null,
      assignedToUsername: (t.assignedTo as { username?: string })?.username ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
    return NextResponse.json({ tickets: list })
  } catch (error: unknown) {
    console.error('Tickets list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { subject, message, priority } = body
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'subject and message are required' },
        { status: 400 }
      )
    }
    const mongoose = await import('mongoose')
    const ticket = await Ticket.create({
      userId: new mongoose.Types.ObjectId(authUser.userId),
      subject,
      priority: priority || 'medium',
      messages: [
        {
          body: message,
          fromUser: new mongoose.Types.ObjectId(authUser.userId),
          isStaff: false,
          createdAt: new Date(),
        },
      ],
    })
    const populated = await Ticket.findById(ticket._id)
      .populate('userId', 'username')
      .lean()
    return NextResponse.json(
      {
        ticket: {
          id: ticket._id.toString(),
          userId: authUser.userId,
          username: (populated?.userId as { username?: string })?.username ?? authUser.username,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          messages: ticket.messages,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Ticket create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
