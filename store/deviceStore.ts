import { create } from 'zustand'

interface DeviceState {
  isConnected: boolean
  deviceVersion: string
  firmwareVersion: string
  batteryLevel: number
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  connect: () => Promise<void>
  disconnect: () => void
  checkConnection: () => Promise<void>
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isConnected: false,
  deviceVersion: 'Aura Pro v2.1',
  firmwareVersion: '2.1.0',
  batteryLevel: 85,
  connectionStatus: 'disconnected',
  connect: async () => {
    set({ connectionStatus: 'connecting' })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    set({
      isConnected: true,
      connectionStatus: 'connected',
      batteryLevel: Math.floor(Math.random() * 30) + 70,
    })
  },
  disconnect: () => {
    set({
      isConnected: false,
      connectionStatus: 'disconnected',
    })
  },
  checkConnection: async () => {
    // Simulación de verificación de conexión
    const connected = Math.random() > 0.5
    set({
      isConnected: connected,
      connectionStatus: connected ? 'connected' : 'disconnected',
      batteryLevel: connected ? Math.floor(Math.random() * 30) + 70 : 0,
    })
  },
}))
