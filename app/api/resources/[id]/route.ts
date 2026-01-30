import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Resource from '@/models/Resource'
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
    const resource = await Resource.findById(id)
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }
    const body = await request.json()
    const {
      title,
      description,
      type,
      url,
      s3Key,
      duration,
      size,
      level,
      order,
      visible,
    } = body
    if (title != null) resource.title = title
    if (description != null) resource.description = description
    if (type != null) resource.type = type
    if (url != null) resource.url = url
    if (s3Key != null) resource.s3Key = s3Key
    if (duration != null) resource.duration = duration
    if (size != null) resource.size = size
    if (level != null) resource.level = level
    if (order != null) resource.order = order
    if (visible != null) resource.visible = visible
    await resource.save()
    return NextResponse.json({
      resource: {
        id: resource._id.toString(),
        title: resource.title,
        description: resource.description,
        type: resource.type,
        url: resource.url,
        s3Key: resource.s3Key,
        duration: resource.duration,
        size: resource.size,
        level: resource.level,
        order: resource.order,
        visible: resource.visible,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      },
    })
  } catch (error: unknown) {
    console.error('Resource update error:', error)
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
    const resource = await Resource.findByIdAndDelete(id)
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Resource deleted' })
  } catch (error: unknown) {
    console.error('Resource delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
