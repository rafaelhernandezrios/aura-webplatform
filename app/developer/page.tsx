'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { useAuthStore } from '@/store/authStore'
import { FiKey, FiCopy, FiEye, FiEyeOff, FiGithub, FiBook, FiExternalLink } from 'react-icons/fi'

export default function DeveloperPage() {
  const router = useRouter()
  const { isAuthenticated, hydrated, user, initialize } = useAuthStore()
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Key', key: 'aura_prod_xxxxxxxxxxxxxxxxxxxx', visible: false, created: '2024-01-15' },
    { id: '2', name: 'Development Key', key: 'aura_dev_xxxxxxxxxxxxxxxxxxxx', visible: false, created: '2024-01-10' },
  ])
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [hydrated, isAuthenticated, router])

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(keys =>
      keys.map(key =>
        key.id === id ? { ...key, visible: !key.visible } : key
      )
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('API Key copied to clipboard')
  }

  const generateNewKey = () => {
    if (!newKeyName.trim()) return
    
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `aura_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      visible: true,
      created: new Date().toISOString().split('T')[0],
    }
    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
  }

  if (!hydrated || !isAuthenticated) return null

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">
            Developer <span className="text-gradient">Hub</span>
          </h1>
          <p className="text-white/60">
            Manage your API Keys and access technical documentation
          </p>
        </div>

        <div className="mb-6 p-4 bg-electric-cyan/10 border border-electric-cyan/40 rounded-lg text-center">
          <p className="text-sm text-white/80">
            <strong>Preview / Coming soon.</strong> API Keys are not yet persisted. This section will be connected to the backend soon.
          </p>
        </div>

        {/* API Keys Section */}
        <div className="glass-card-hover p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FiKey className="text-electric-cyan" />
              API Keys
            </h2>
            {user?.role === 'user' && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="New key name"
                  className="input-field w-64"
                  onKeyPress={(e) => e.key === 'Enter' && generateNewKey()}
                />
                <button onClick={generateNewKey} className="btn-primary">
                  Generate New Key
                </button>
              </div>
            )}
          </div>

          {user?.role !== 'user' && (
            <div className="mb-4 p-4 bg-neon-violet/20 border border-neon-violet/50 rounded-lg">
              <p className="text-sm text-white/80">
                ⚠️ API Key generation is only available for Pro users.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {apiKeys.map((apiKey, index) => (
              <div
                key={apiKey.id}
                className="p-4 bg-glass-surface rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{apiKey.name}</h3>
                    <span className="text-xs text-white/40">
                      Created: {apiKey.created}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-deep-space px-3 py-1 rounded">
                      {apiKey.visible ? apiKey.key : '•'.repeat(apiKey.key.length)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1 hover:text-electric-cyan transition-colors"
                    >
                      {apiKey.visible ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="p-1 hover:text-electric-cyan transition-colors"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation Section */}
        <div className="glass-card-hover p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FiBook className="text-electric-cyan" />
            Documentación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="#"
              className="p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                API Reference
                <FiExternalLink className="text-sm" />
              </h3>
              <p className="text-sm text-white/60">
                Complete documentation of the Aura REST API
              </p>
            </a>

            <a
              href="#"
              className="p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                SDK Documentation
                <FiExternalLink className="text-sm" />
              </h3>
              <p className="text-sm text-white/60">
                Integration guides for Python, JavaScript and more
              </p>
            </a>

            <a
              href="#"
              className="p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Quick Start Guide
                <FiExternalLink className="text-sm" />
              </h3>
              <p className="text-sm text-white/60">
                Start developing in 5 minutes
              </p>
            </a>

            <a
              href="#"
              className="p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Best Practices
                <FiExternalLink className="text-sm" />
              </h3>
              <p className="text-sm text-white/60">
                Recommended patterns and optimizations
              </p>
            </a>
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="glass-card-hover p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <FiGithub className="text-electric-cyan" />
            GitHub Repositories
          </h2>

          <div className="space-y-4">
            <a
              href="#"
              className="block p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">aura-sdk-python</h3>
                  <p className="text-sm text-white/60">
                    Official Python SDK for Aura integration
                  </p>
                </div>
                <FiExternalLink className="text-electric-cyan" />
              </div>
            </a>

            <a
              href="#"
              className="block p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">aura-sdk-js</h3>
                  <p className="text-sm text-white/60">
                    JavaScript/TypeScript SDK for web applications
                  </p>
                </div>
                <FiExternalLink className="text-electric-cyan" />
              </div>
            </a>

            <a
              href="#"
              className="block p-4 bg-glass-surface rounded-lg hover:border-electric-cyan/50 transition-all border border-transparent"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">aura-examples</h3>
                  <p className="text-sm text-white/60">
                    Code examples and reference projects
                  </p>
                </div>
                <FiExternalLink className="text-electric-cyan" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
