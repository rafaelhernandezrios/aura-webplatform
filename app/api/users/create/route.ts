import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
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

    // Only admins can create users
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create new users' },
        { status: 403 }
      )
    }

    const { name, username, password, role, isActive } = await request.json()

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, username, and password are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user (admins can set role and active status)
    const newUser = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true, // Admins can create active users
      createdBy: authUser.userId,
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
