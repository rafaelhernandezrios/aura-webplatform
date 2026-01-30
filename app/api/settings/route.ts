import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Setting from '@/models/Setting'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const settings = await Setting.find({}).sort({ key: 1 }).lean()
    const list = settings.map((s) => ({
      id: s._id.toString(),
      key: s.key,
      value: s.value,
      updatedAt: s.updatedAt,
    }))
    return NextResponse.json({ settings: list })
  } catch (error: unknown) {
    console.error('Settings list error:', error)
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
    const { key, value } = body
    if (key === undefined || key === null || key === '') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }
    const setting = await Setting.findOneAndUpdate(
      { key: String(key).trim() },
      { $set: { value: value !== undefined ? value : '' } },
      { new: true, upsert: true }
    )
    return NextResponse.json(
      {
        setting: {
          id: setting._id.toString(),
          key: setting.key,
          value: setting.value,
          updatedAt: setting.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Setting upsert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
