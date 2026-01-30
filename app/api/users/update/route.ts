import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
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

    // Only admins can update users
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update users' },
        { status: 403 }
      )
    }

    const { userId, name, username, password, role, isActive } = await request.json()

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

    // Update fields
    if (name) user.name = name.trim()
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: username.toLowerCase().trim(),
        _id: { $ne: userId }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already registered' },
          { status: 409 }
        )
      }
      user.username = username.toLowerCase().trim()
    }
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }
    if (role) user.role = role
    if (isActive !== undefined) user.isActive = isActive

    await user.save()

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
