import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Ticket from '@/models/Ticket'
import Release from '@/models/Release'
import Announcement from '@/models/Announcement'
import Device from '@/models/Device'
import Resource from '@/models/Resource'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      activeUsers,
      totalTickets,
      openTickets,
      totalReleases,
      totalAnnouncements,
      activeAnnouncements,
      totalDevices,
      totalResources,
      ticketsByStatus,
      ticketsByPriority,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Release.countDocuments(),
      Announcement.countDocuments(),
      Announcement.countDocuments({ active: true }),
      Device.countDocuments(),
      Resource.countDocuments({ visible: true }),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    ])

    const byStatus = Object.fromEntries(
      ticketsByStatus.map((s: { _id: string; count: number }) => [s._id, s.count])
    )
    const byPriority = Object.fromEntries(
      ticketsByPriority.map((p: { _id: string; count: number }) => [p._id, p.count])
    )

    return NextResponse.json({
      analytics: {
        users: { total: totalUsers, active: activeUsers },
        tickets: {
          total: totalTickets,
          open: openTickets,
          byStatus: byStatus,
          byPriority: byPriority,
        },
        releases: { total: totalReleases },
        announcements: { total: totalAnnouncements, active: activeAnnouncements },
        devices: { total: totalDevices },
        resources: { total: totalResources },
      },
    })
  } catch (error: unknown) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
