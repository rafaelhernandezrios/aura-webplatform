# MongoDB Setup Guide

## 📋 Prerequisites

1. MongoDB Atlas cluster named "AURA"
2. Collection "users" in the database

## 🔧 Configuration

1. Create `.env.local` file in the root directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/AURA?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

2. Install dependencies:

```bash
npm install
```

## 🚀 Creating Initial Users

### Create Admin User

```bash
npx ts-node scripts/create-admin.ts
```

This will create an admin user with:
- Email: `admin@aura.neurotech`
- Password: `Admin123!`
- Role: `admin`
- Status: `active`

**⚠️ IMPORTANT: Change the password after first login!**

### Create Regular User

```bash
npx ts-node scripts/create-user.ts "User Name" "user@example.com" "password123" true
```

Or use defaults:
```bash
npx ts-node scripts/create-user.ts
```

## 🔐 User Roles

- **admin**: Full system access
- **user**: Can create and activate other users

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### User Management (requires authentication)
- `GET /api/users/me` - Get current user
- `GET /api/users/list` - List all users (for admin panel)
- `POST /api/users/create` - Create new user (only users with role 'user' can create)
- `PATCH /api/users/activate` - Activate user (only users with role 'user' can activate)

## 🔑 Authorization

All user management endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- Only users with role 'user' can create and activate other users
- Admins have full access but cannot create/activate users through the API

## 📊 Database Schema

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'user'
  isActive: boolean
  createdBy?: ObjectId (reference to User)
  createdAt: Date
  updatedAt: Date
}
```

## 🎯 Next Steps

1. Create admin user using the script
2. Login with admin credentials
3. Create regular users through the admin panel
4. Regular users can then create and activate other users
