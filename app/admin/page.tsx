'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import {
  FiBarChart2,
  FiUsers,
  FiPackage,
  FiBell,
  FiMessageCircle,
  FiCpu,
  FiBook,
  FiSettings,
} from 'react-icons/fi'
import AdminAnalytics from '@/components/admin/AdminAnalytics'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminReleases from '@/components/admin/AdminReleases'
import AdminAnnouncements from '@/components/admin/AdminAnnouncements'
import AdminTickets from '@/components/admin/AdminTickets'
import AdminDevices from '@/components/admin/AdminDevices'
import AdminResources from '@/components/admin/AdminResources'
import AdminSettings from '@/components/admin/AdminSettings'

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'releases', label: 'Releases', icon: FiPackage },
  { id: 'announcements', label: 'Announcements', icon: FiBell },
  { id: 'tickets', label: 'Tickets', icon: FiMessageCircle },
  { id: 'devices', label: 'Devices', icon: FiCpu },
  { id: 'resources', label: 'Resources', icon: FiBook },
  { id: 'settings', label: 'Settings', icon: FiSettings },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, user, token, initialize } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabId>('analytics')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [hydrated, isAuthenticated, router])

  if (!hydrated || !isAuthenticated) return null

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-white/60">This page is only accessible to administrators.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <div className="mb-6">
          <h1 className="text-4xl font-display font-bold mb-2">
            Admin <span className="text-gradient">Panel</span>
          </h1>
          <p className="text-white/60">Manage users, releases, announcements, tickets, devices, and settings</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-electric-cyan text-deep-space font-semibold'
                    : 'glass-card-hover hover:bg-glass-surface'
                }`}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'analytics' && <AdminAnalytics token={token} />}
          {activeTab === 'users' && <AdminUsers token={token} />}
          {activeTab === 'releases' && <AdminReleases token={token} />}
          {activeTab === 'announcements' && <AdminAnnouncements token={token} />}
          {activeTab === 'tickets' && <AdminTickets token={token} />}
          {activeTab === 'devices' && <AdminDevices token={token} />}
          {activeTab === 'resources' && <AdminResources token={token} />}
          {activeTab === 'settings' && <AdminSettings token={token} />}
        </div>
      </div>
    </Layout>
  )
}
