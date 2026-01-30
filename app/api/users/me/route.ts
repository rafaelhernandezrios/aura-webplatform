import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await User.findById(authUser.userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  } catch (error: unknown) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, password, currentPassword } = body

    const user = await User.findById(authUser.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (name != null && typeof name === 'string') {
      user.name = name.trim()
    }

    if (password != null && password !== '') {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password' },
          { status: 400 }
        )
      }
      const isCurrentValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        )
      }
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    await user.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  } catch (error: unknown) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
