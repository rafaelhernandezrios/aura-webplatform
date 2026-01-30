import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
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

    // Only admins can activate/deactivate users
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can manage user status' },
        { status: 403 }
      )
    }

    const { userId, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user status
    user.isActive = isActive !== undefined ? isActive : !user.isActive
    await user.save()

    return NextResponse.json({
      message: 'User activated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error: any) {
    console.error('Activate user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
