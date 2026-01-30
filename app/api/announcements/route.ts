import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'
    const admin = authUser?.role === 'admin'

    let query: Record<string, unknown> = {}
    if (activeOnly && !admin) {
      query.active = true
      query.$or = [
        { startAt: { $exists: false }, endAt: { $exists: false } },
        { startAt: { $lte: new Date() }, endAt: { $gte: new Date() } },
        { startAt: null, endAt: null },
      ]
    }
    const announcements = await Announcement.find(query).sort({ createdAt: -1 })
    const list = announcements.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      body: a.body,
      type: a.type,
      active: a.active,
      startAt: a.startAt,
      endAt: a.endAt,
      createdAt: a.createdAt,
    }))
    return NextResponse.json({ announcements: list })
  } catch (error: unknown) {
    console.error('Announcements list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { title, body: bodyText, type, active, startAt, endAt } = body
    if (!title || bodyText === undefined) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }
    const announcement = await Announcement.create({
      title,
      body: bodyText,
      type: type || 'news',
      active: active !== false,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
    })
    return NextResponse.json({
      announcement: {
        id: announcement._id.toString(),
        title: announcement.title,
        body: announcement.body,
        type: announcement.type,
        active: announcement.active,
        startAt: announcement.startAt,
        endAt: announcement.endAt,
        createdAt: announcement.createdAt,
      },
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Announcement create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
