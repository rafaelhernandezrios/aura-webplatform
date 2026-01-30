/**
 * Script to create the first admin user
 * Run with: node scripts/create-admin.js
 * Requires: .env.local with MONGO_URI
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User Schema (inline, must match models/User.ts: username, not email)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'users' }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local')
  process.exit(1)
}

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      console.log(`   Username: ${existingAdmin.username}`)
      await mongoose.disconnect()
      process.exit(0)
    }

    const adminUsername = 'admin'
    const adminPassword = 'Admin123!'

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    await User.create({
      name: 'Admin User',
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Username: ${adminUsername}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('   ⚠️  Change the password after first login (Profile or Admin).')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createAdmin()
