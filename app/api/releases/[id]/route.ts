import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Release from '@/models/Release'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

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
    const release = await Release.findById(id)
    if (!release) return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    if (body.version != null) release.version = body.version
    if (body.fileName != null) release.fileName = body.fileName
    if (body.platform != null) release.platform = body.platform
    if (body.platformLabel != null) release.platformLabel = body.platformLabel
    if (body.size != null) release.size = body.size
    if (body.changelog != null) release.changelog = body.changelog
    if (body.isLatest === true) {
      await Release.updateMany({ _id: { $ne: id } }, { $set: { isLatest: false } })
      release.isLatest = true
    } else if (body.isLatest === false) release.isLatest = false
    await release.save()
    return NextResponse.json({
      release: {
        id: release._id.toString(),
        version: release.version,
        fileName: release.fileName,
        platform: release.platform,
        platformLabel: release.platformLabel,
        size: release.size,
        changelog: release.changelog,
        isLatest: release.isLatest,
        createdAt: release.createdAt,
      },
    })
  } catch (error: unknown) {
    console.error('Release update error:', error)
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
    const release = await Release.findByIdAndDelete(id)
    if (!release) return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    return NextResponse.json({ message: 'Release deleted' })
  } catch (error: unknown) {
    console.error('Release delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
