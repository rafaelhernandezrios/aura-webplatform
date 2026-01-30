import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Setting from '@/models/Setting'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await connectDB()
    const { key } = await params
    const decodedKey = decodeURIComponent(key)
    const setting = await Setting.findOne({ key: decodedKey }).lean()
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    return NextResponse.json({
      setting: {
        id: setting._id.toString(),
        key: setting.key,
        value: setting.value,
        updatedAt: setting.updatedAt,
      },
    })
  } catch (error: unknown) {
    console.error('Setting get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { key } = await params
    const decodedKey = decodeURIComponent(key)
    const body = await request.json()
    const { value } = body
    const setting = await Setting.findOneAndUpdate(
      { key: decodedKey },
      { $set: { value: value !== undefined ? value : '' } },
      { new: true }
    )
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    return NextResponse.json({
      setting: {
        id: setting._id.toString(),
        key: setting.key,
        value: setting.value,
        updatedAt: setting.updatedAt,
      },
    })
  } catch (error: unknown) {
    console.error('Setting update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { key } = await params
    const decodedKey = decodeURIComponent(key)
    const setting = await Setting.findOneAndDelete({ key: decodedKey })
    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Setting deleted' })
  } catch (error: unknown) {
    console.error('Setting delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
