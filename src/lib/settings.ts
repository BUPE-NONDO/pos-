export interface AppSettings {
  onboardingComplete: boolean
  businessName?: string
  taxRate?: number
  packageTier?: string
  // Branding
  logoDataUrl?: string
  receiptHeader?: string
  currency?: string
  // Trial
  trialActive?: boolean
  trialStart?: string
  trialExpires?: string
  darkMode?: boolean
}

const STORAGE_KEY = 'pos_app_settings_v1'

import { supabase, isSupabaseConfigured } from './supabase'

export const SettingsService = {
  getInstallId(): string {
    const key = 'pos_install_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = 'inst-' + Math.random().toString(36).slice(2, 10)
      try {
        localStorage.setItem(key, id)
      } catch (e) {
        console.warn('Failed to persist install id:', e)
      }
    }
    return id
  },

  getSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return { onboardingComplete: false }
      const parsed = JSON.parse(raw) as AppSettings

      // Migrate older taxRate stored as percent (e.g., 16) to decimal (0.16)
      if (parsed.taxRate && parsed.taxRate > 1) {
        try {
          parsed.taxRate = parsed.taxRate / 100
          // persist migration
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        } catch (e) {
          console.warn('Failed to migrate taxRate:', e)
        }
      }

      return parsed
    } catch (error) {
      console.warn('Failed to read settings:', error)
      return { onboardingComplete: false }
    }
  },

  async saveSettingsRemote(installId?: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return false
    try {
      const id = installId || this.getInstallId()
      const settings = this.getSettings()
      // Upsert into app_settings table (install_id PK) - table should be created in Supabase
      const payload = { install_id: id, settings: settings }
      const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'install_id' })
      if (error) {
        console.error('Failed to save settings remotely:', error)
        return false
      }
      return true
    } catch (e) {
      console.warn('Remote save failed:', e)
      return false
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings()
    const merged = { ...current, ...settings }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } catch (error) {
      console.warn('Failed to save settings:', error)
    }

    // Best-effort remote save (don't block)
    this.saveSettingsRemote().catch(() => {})

    return merged
  },

  // Start a 1-week free trial (sets timestamps and marks active)
  startTrial(): AppSettings {
    const now = new Date()
    const expires = new Date(now)
    expires.setDate(expires.getDate() + 7)
    const settings = this.saveSettings({
      trialActive: true,
      trialStart: now.toISOString(),
      trialExpires: expires.toISOString(),
    })
    console.log('✅ Trial started until', settings.trialExpires)
    return settings
  },

  endTrial(): AppSettings {
    const settings = this.saveSettings({ trialActive: false, trialStart: undefined, trialExpires: undefined })
    console.log('⚠️ Trial ended')
    return settings
  },

  isTrialActive(): boolean {
    const s = this.getSettings()
    if (!s.trialActive || !s.trialExpires) return false
    const now = new Date()
    const expires = new Date(s.trialExpires)
    return now < expires
  },

  trialDaysLeft(): number {
    const s = this.getSettings()
    if (!s.trialActive || !s.trialExpires) return 0
    const now = new Date()
    const expires = new Date(s.trialExpires)
    const diffMs = expires.getTime() - now.getTime()
    if (diffMs <= 0) return 0
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  },

  markOnboardingComplete(): void {
    this.saveSettings({ onboardingComplete: true })
  },
}
