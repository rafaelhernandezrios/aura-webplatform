import { create } from 'zustand'

interface AppConfigState {
  siteName: string
  maintenanceMode: boolean
  loaded: boolean
  fetchConfig: () => Promise<void>
}

export const useAppConfigStore = create<AppConfigState>((set) => ({
  siteName: 'Aura Portal',
  maintenanceMode: false,
  loaded: false,
  fetchConfig: async () => {
    try {
      const [siteRes, maintenanceRes] = await Promise.all([
        fetch('/api/settings/site_name').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/settings/maintenance_mode').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ])
      set({
        siteName: siteRes?.setting?.value != null ? String(siteRes.setting.value) : 'Aura Portal',
        maintenanceMode: maintenanceRes?.setting?.value === true || maintenanceRes?.setting?.value === 'true',
        loaded: true,
      })
    } catch {
      set({ loaded: true })
    }
  },
}))
