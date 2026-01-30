'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import { FiUser, FiLock } from 'react-icons/fi'

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, user, initialize, token, fetchCurrentUser } = useAuthStore()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.push('/login')
  }, [hydrated, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError('')
    setSuccess('')
    setSaving(true)

    if (newPassword !== '' || confirmPassword !== '') {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        setSaving(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match')
        setSaving(false)
        return
      }
      if (!currentPassword) {
        setError('Current password is required to change password')
        setSaving(false)
        return
      }
    }

    try {
      const body: { name?: string; password?: string; currentPassword?: string } = { name: name.trim() }
      if (newPassword) {
        body.password = newPassword
        body.currentPassword = currentPassword
      }
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Profile updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        await fetchCurrentUser()
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (!hydrated || !isAuthenticated) return null

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-white/60">View and edit your account details</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="glass-card-hover p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiUser className="text-electric-cyan" />
              Account info
            </h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Username</label>
              <p className="text-white/60 py-2">{user?.username}</p>
              <p className="text-xs text-white/50">Username cannot be changed here. Contact an administrator if needed.</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-white/80">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="glass-card-hover p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiLock className="text-electric-cyan" />
              Change password
            </h2>
            <p className="text-sm text-white/60 mb-4">Leave blank to keep your current password.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
