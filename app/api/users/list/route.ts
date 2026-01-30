import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Verify authentication
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can list all users
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can view all users' },
        { status: 403 }
      )
    }

    // Get all users (for admin panel)
    const users = await User.find({})
      .select('-password')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdBy: user.createdBy
          ? {
              id: (user.createdBy as any)._id?.toString(),
              name: (user.createdBy as any).name,
              username: (user.createdBy as any).username,
            }
          : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error('List users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
