import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Release from '@/models/Release'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const latestOnly = searchParams.get('latest') === 'true'

    let query: Record<string, unknown> = {}
    if (platform && platform !== 'all') query.platform = { $in: [platform, 'all'] }
    if (latestOnly) query.isLatest = true

    const releases = await Release.find(query).sort({ createdAt: -1 })
    const list = releases.map((r) => ({
      id: r._id.toString(),
      version: r.version,
      fileName: r.fileName,
      platform: r.platform,
      platformLabel: r.platformLabel,
      size: r.size,
      changelog: r.changelog,
      isLatest: r.isLatest,
      createdAt: r.createdAt,
    }))
    return NextResponse.json({ releases: list })
  } catch (error: unknown) {
    console.error('Releases list error:', error)
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
    const { version, fileName, platform, platformLabel, size, changelog, isLatest } = body
    if (!version || !fileName || !platform || !platformLabel) {
      return NextResponse.json(
        { error: 'version, fileName, platform, platformLabel are required' },
        { status: 400 }
      )
    }
    if (isLatest) {
      await Release.updateMany({}, { $set: { isLatest: false } })
    }
    const release = await Release.create({
      version,
      fileName,
      platform,
      platformLabel,
      size: size || '',
      changelog: changelog || '',
      isLatest: isLatest ?? false,
    })
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
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Release create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
