import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Resource from '@/models/Resource'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const visibleOnly = searchParams.get('visible') !== 'false'
    const admin = authUser?.role === 'admin'

    const query: Record<string, unknown> = {}
    if (visibleOnly && !admin) query.visible = true

    const resources = await Resource.find(query).sort({ order: 1, createdAt: 1 })
    const list = resources.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      description: r.description,
      type: r.type,
      url: r.url,
      s3Key: r.s3Key,
      duration: r.duration,
      size: r.size,
      level: r.level,
      order: r.order,
      visible: r.visible,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))
    return NextResponse.json({ resources: list })
  } catch (error: unknown) {
    console.error('Resources list error:', error)
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
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'title, description and type are required' },
        { status: 400 }
      )
    }
    const resource = await Resource.create({
      title,
      description,
      type: type || 'link',
      url: url || '',
      s3Key: s3Key || '',
      duration: duration || '',
      size: size || '',
      level: level || undefined,
      order: order ?? 0,
      visible: visible !== false,
    })
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Resource create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
