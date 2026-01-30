import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Announcement from '@/models/Announcement'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(
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
    const body = await request.json()
    const announcement = await Announcement.findById(id)
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    if (body.title != null) announcement.title = body.title
    if (body.body != null) announcement.body = body.body
    if (body.type != null) announcement.type = body.type
    if (body.active != null) announcement.active = body.active
    if (body.startAt != null) announcement.startAt = body.startAt ? new Date(body.startAt) : undefined
    if (body.endAt != null) announcement.endAt = body.endAt ? new Date(body.endAt) : undefined
    await announcement.save()
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
    })
  } catch (error: unknown) {
    console.error('Announcement update error:', error)
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
    const announcement = await Announcement.findByIdAndDelete(id)
    if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    return NextResponse.json({ message: 'Announcement deleted' })
  } catch (error: unknown) {
    console.error('Announcement delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
