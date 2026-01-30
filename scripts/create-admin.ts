/**
 * Script to create the first admin user
 * Run with: npx ts-node scripts/create-admin.ts
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

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI as string)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      console.log(`   Email: ${existingAdmin.email}`)
      process.exit(0)
    }

    // Create admin user
    const adminEmail = 'admin@aura.neurotech'
    const adminPassword = 'Admin123!'
    
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('   ⚠️  Please change the password after first login!')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
