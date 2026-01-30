'use client'

import { useEffect, useState } from 'react'
import { FiUserPlus, FiRefreshCw, FiUsers, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiCpu } from 'react-icons/fi'

interface User {
  id: string
  name: string
  username: string
  role: 'admin' | 'user'
  isActive: boolean
  createdBy?: { id: string; name: string; username: string } | null
  createdAt: string
}

interface DeviceOption {
  id: string
  serialNumber: string
  model: string
  userId?: { id: string } | null
}

export default function AdminUsers({ token }: { token: string | null }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'user', isActive: true })
  const [creating, setCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devices, setDevices] = useState<DeviceOption[]>([])
  const [assignedDeviceIds, setAssignedDeviceIds] = useState<string[]>([])

  const fetchUsers = async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch('/api/users/list', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else setError('Failed to load users')
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const fetchDevices = async (): Promise<DeviceOption[]> => {
    if (!token) return []
    try {
      const res = await fetch('/api/devices', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        const list = data.devices || []
        setDevices(list)
        return list
      }
    } catch {
      // ignore
    }
    return []
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        const newUserId = data.user?.id
        if (newUserId && assignedDeviceIds.length > 0) {
          for (const deviceId of assignedDeviceIds) {
            await fetch(`/api/devices/${deviceId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ userId: newUserId }),
            })
          }
        }
        setSuccess('User created successfully' + (assignedDeviceIds.length > 0 ? ` with ${assignedDeviceIds.length} device(s) assigned` : ''))
        setNewUser({ name: '', username: '', password: '', role: 'user', isActive: true })
        setAssignedDeviceIds([])
        setShowCreateForm(false)
        fetchUsers()
      } else setError(data.error || 'Failed to create user')
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (!token) return
    try {
      const res = await fetch('/api/users/activate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchUsers()
      } else setError(data.error || 'Failed to update')
    } catch {
      setError('Network error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const res = await fetch(`/api/users/delete?userId=${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('User deleted successfully')
        fetchUsers()
      } else setError(data.error || 'Failed to delete')
    } catch {
      setError('Network error')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    if (!editingUser || !token) return
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    try {
      const res = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: editingUser.id,
          name: newUser.name,
          username: newUser.username,
          password: newUser.password || undefined,
          role: newUser.role,
          isActive: newUser.isActive,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        for (const device of devices) {
          const isAssigned = assignedDeviceIds.includes(device.id)
          const currentlyAssignedToThisUser = device.userId?.id === editingUser.id
          if (isAssigned && !currentlyAssignedToThisUser) {
            await fetch(`/api/devices/${device.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ userId: editingUser.id }),
            })
          } else if (!isAssigned && currentlyAssignedToThisUser) {
            await fetch(`/api/devices/${device.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ userId: null }),
            })
          }
        }
        setSuccess('User updated successfully')
        setEditingUser(null)
        setNewUser({ name: '', username: '', password: '', role: 'user', isActive: true })
        setAssignedDeviceIds([])
        setShowCreateForm(false)
        fetchUsers()
      } else setError(data.error || 'Failed to update')
    } catch {
      setError('Network error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FiUsers className="text-electric-cyan" /> Users
        </h2>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              setEditingUser(null)
              if (!showCreateForm) {
                setNewUser({ name: '', username: '', password: '', role: 'user', isActive: true })
                setAssignedDeviceIds([])
                fetchDevices()
              }
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiUserPlus /> Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">{error}</div>
      )}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">{success}</div>
      )}

      {(showCreateForm || editingUser) && (
        <div className="glass-card-hover p-6">
          <h3 className="text-xl font-semibold mb-4">{editingUser ? 'Edit User' : 'Create New User'}</h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">Username</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="input-field"
                placeholder="username"
                required
                minLength={3}
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                Password {editingUser && '(leave empty to keep current)'}
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required={!editingUser}
                minLength={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">Status</label>
                <select
                  value={newUser.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setNewUser({ ...newUser, isActive: e.target.value === 'active' })}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80 flex items-center gap-2">
                <FiCpu className="text-electric-cyan" />
                {editingUser ? 'Devices assigned to this user' : 'Assign devices (optional)'}
              </label>
              <p className="text-xs text-white/50 mb-2">
                {editingUser
                  ? 'Check the devices that should belong to this user. Uncheck to unassign.'
                  : 'Select devices to assign to the new user after creation.'}
              </p>
              {devices.length === 0 ? (
                <p className="text-sm text-white/50 py-2">No devices in the system. Add devices in Admin → Devices first.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-glass-surface rounded-lg">
                  {devices.map((d) => {
                    const assignedToOther = d.userId && d.userId.id !== editingUser?.id
                    return (
                      <label
                        key={d.id}
                        className={`flex items-center gap-3 py-1.5 px-2 rounded cursor-pointer hover:bg-white/5 ${assignedToOther ? 'opacity-60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={assignedDeviceIds.includes(d.id)}
                          onChange={(e) => {
                            if (assignedToOther && e.target.checked) return
                            setAssignedDeviceIds((prev) =>
                              e.target.checked ? [...prev, d.id] : prev.filter((id) => id !== d.id)
                            )
                          }}
                          disabled={assignedToOther}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {d.serialNumber} · {d.model}
                          {assignedToOther && (
                            <span className="text-white/50 ml-1">(assigned to another user)</span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingUser(null)
                  setNewUser({ name: '', username: '', password: '', role: 'user', isActive: true })
                  setError('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card-hover p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 text-sm bg-glass-surface rounded-full">{users.length}</span>
        </div>
        {loading ? (
          <p className="text-white/60">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-white/60">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Username</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-glass-surface/50">
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4 text-white/60">{u.username}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${u.role === 'admin' ? 'bg-neon-violet/20 text-neon-violet' : 'bg-electric-cyan/20 text-electric-cyan'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/60 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className="p-2 hover:bg-electric-cyan/20 rounded text-electric-cyan"
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setNewUser({ name: u.name, username: u.username, password: '', role: u.role, isActive: u.isActive })
                            setShowCreateForm(false)
                            fetchDevices().then((devs) => {
                              setAssignedDeviceIds(devs.filter((d) => d.userId?.id === u.id).map((d) => d.id))
                            })
                          }}
                          className="p-2 hover:bg-neon-violet/20 rounded text-neon-violet"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-400"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
