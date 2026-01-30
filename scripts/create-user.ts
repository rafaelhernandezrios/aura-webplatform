/**
 * Script to create a regular user
 * Run with: npx ts-node scripts/create-user.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Import after env is loaded
const User = require('../models/User').default

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local')
  process.exit(1)
}

async function createUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Get user data from command line arguments or use defaults
    const name = process.argv[2] || 'Test User'
    const email = process.argv[3] || 'user@aura.neurotech'
    const password = process.argv[4] || 'User123!'
    const isActive = process.argv[5] === 'true' || false

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('⚠️  User already exists with this email')
      process.exit(0)
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      isActive,
    })

    console.log('✅ User created successfully!')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.isActive}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }
}

createUser()
