import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Device from '@/models/Device'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mongoose = await import('mongoose')
    const devices = await Device.find({
      userId: new mongoose.Types.ObjectId(authUser.userId),
    })
      .sort({ createdAt: -1 })
      .lean()

    const list = devices.map((d) => ({
      id: d._id.toString(),
      serialNumber: d.serialNumber,
      model: d.model,
      firmwareVersion: d.firmwareVersion,
      status: d.status,
      lastSeen: d.lastSeen,
      createdAt: d.createdAt,
    }))

    return NextResponse.json({ devices: list })
  } catch (error: unknown) {
    console.error('My devices list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
