import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Device from '@/models/Device'
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
    const device = await Device.findById(id)
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    if ('userId' in body) {
      const mongoose = await import('mongoose')
      device.userId = body.userId ? new mongoose.Types.ObjectId(body.userId) as import('mongoose').Types.ObjectId : undefined
    }
    if (body.model != null) device.model = body.model
    if (body.firmwareVersion != null) device.firmwareVersion = body.firmwareVersion
    if (body.status != null) device.status = body.status
    if (body.lastSeen != null) device.lastSeen = body.lastSeen
    await device.save()
    return NextResponse.json({
      device: {
        id: device._id.toString(),
        serialNumber: device.serialNumber,
        userId: device.userId?.toString(),
        model: device.model,
        firmwareVersion: device.firmwareVersion,
        status: device.status,
        lastSeen: device.lastSeen,
        createdAt: device.createdAt,
      },
    })
  } catch (error: unknown) {
    console.error('Device update error:', error)
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
    const device = await Device.findByIdAndDelete(id)
    if (!device) return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    return NextResponse.json({ message: 'Device deleted' })
  } catch (error: unknown) {
    console.error('Device delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
