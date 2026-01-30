export interface User {
  name: string
  email: string
  plan: 'free' | 'pro'
}

export interface Device {
  isConnected: boolean
  deviceVersion: string
  firmwareVersion: string
  batteryLevel: number
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}

export interface SoftwareItem {
  id: number
  name: string
  version: string
  description: string
  os: 'windows' | 'macos' | 'linux' | 'mobile' | 'all'
  osName: string
  size: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  visible: boolean
  created: string
}

export interface Ticket {
  id: string
  subject: string
  status: 'open' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  lastUpdate: string
}
