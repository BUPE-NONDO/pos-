import { v4 as uuidv4 } from 'uuid'
import offline from './offline'
import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEY = 'pos_app_settings_v1'
const INSTALL_ID_KEY = 'pos_install_id'

export type AppSettings = {
  businessName?: string
  taxRate?: number
  logoDataUrl?: string
  receiptHeader?: string
  currency?: string
  packageTier?: string
  trialActive?: boolean
  trialStart?: string | null
  trialExpires?: string | null
}

export const SettingsService = {
  getInstallId(): string {
    let id = localStorage.getItem(INSTALL_ID_KEY) || ''
    if (!id) {
      id = uuidv4()
      localStorage.setItem(INSTALL_ID_KEY, id)
    }
    return id
  },

  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    try {
      return JSON.parse(raw) as AppSettings
    } catch (err) {
      console.warn('Failed to parse settings', err)
      return {}
    }
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    // enqueue remote save
    this.saveSettingsRemote(settings).catch((e) => console.warn('saveSettings remote failed', e))
  },

  async saveSettingsRemote(settings: AppSettings) {
    const installId = this.getInstallId()

    const payload = {
      install_id: installId,
      settings,
      updated_at: new Date().toISOString(),
    }

    // If Supabase configured and online, try to upsert immediately
    if (isSupabaseConfigured() && navigator.onLine && supabase) {
      try {
        const { error } = await supabase.from('app_settings').upsert({ install_id: installId, data: payload }, { onConflict: 'install_id' })
        if (!error) return
      } catch (err) {
        console.warn('Immediate upsert failed, falling back to queue', err)
      }
    }

    // Enqueue for later sync
    await offline.enqueueMutation({
      id: `${installId}:${Date.now()}`,
      table: 'app_settings',
      action: 'upsert',
      payload,
      timestamp: new Date().toISOString(),
      synced: false,
    })
  },

  async isTrialActive(): Promise<boolean> {
    const s = this.getSettings()
    if (!s.trialActive) return false
    if (!s.trialExpires) return true
    return new Date(s.trialExpires) > new Date()
  },

  startTrial(days = 7) {
    const now = new Date()
    const expires = new Date(now)
    expires.setDate(now.getDate() + days)
    const s = this.getSettings()
    s.trialActive = true
    s.trialStart = now.toISOString()
    s.trialExpires = expires.toISOString()
    this.saveSettings(s)
  }
}

export default SettingsService
