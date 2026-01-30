/**
 * Migration script: Remove email index and ensure username index exists
 * Run with: node scripts/migrate-email-to-username.js
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env.local')
  process.exit(1)
}

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    const collection = db.collection('users')

    // Get all indexes
    console.log('\n📋 Current indexes:')
    const indexes = await collection.indexes()
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })

    // Drop email index if it exists
    try {
      console.log('\n🗑️  Dropping email index...')
      await collection.dropIndex('email_1')
      console.log('✅ Email index dropped successfully')
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Email index does not exist (already removed)')
      } else {
        throw error
      }
    }

    // Ensure username index exists
    try {
      console.log('\n📝 Creating username index...')
      await collection.createIndex(
        { username: 1 },
        { unique: true, name: 'username_1' }
      )
      console.log('✅ Username index created successfully')
    } catch (error) {
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log('ℹ️  Username index already exists')
      } else {
        throw error
      }
    }

    // Verify final indexes
    console.log('\n📋 Final indexes:')
    const finalIndexes = await collection.indexes()
    finalIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`)
    })

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

migrate()
