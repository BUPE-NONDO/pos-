declare module '@/lib/settings' {
  export interface AppSettings {
    onboardingComplete: boolean
    businessName?: string
    taxRate?: number
    packageTier?: string
    darkMode?: boolean
  }

  export const SettingsService: {
    getSettings(): AppSettings
    saveSettings(settings: Partial<AppSettings>): AppSettings
    markOnboardingComplete(): void
  }

  export default SettingsService
}
