/**
 * Package Configuration and Limits
 * Defines different subscription tiers and their limitations
 */

export enum PackageTier {
  BASIC = 'basic',
  MEDIUM = 'medium',
  PREMIUM = 'premium',
}

export interface PackageLimits {
  maxProducts: number
  maxTransactionsPerMonth: number
  maxUsers: number
  maxDevices: number
  cloudStorageGB: number
  features: {
    advancedReports: boolean
    customBranding: boolean
    apiAccess: boolean
    multiLocation: boolean
    barcodeGeneration: boolean
    supplierManagement: boolean
  }
}

export const PACKAGE_LIMITS: Record<PackageTier, PackageLimits> = {
  [PackageTier.BASIC]: {
    maxProducts: 500,
    maxTransactionsPerMonth: 1000,
    maxUsers: 2,
    maxDevices: 3,
    cloudStorageGB: 5,
    features: {
      advancedReports: false,
      customBranding: false,
      apiAccess: false,
      multiLocation: false,
      barcodeGeneration: false,
      supplierManagement: false,
    },
  },
  [PackageTier.MEDIUM]: {
    maxProducts: 2000,
    maxTransactionsPerMonth: 5000,
    maxUsers: 5,
    maxDevices: 10,
    cloudStorageGB: 20,
    features: {
      advancedReports: true,
      customBranding: false,
      apiAccess: false,
      multiLocation: false,
      barcodeGeneration: false,
      supplierManagement: true,
    },
  },
  [PackageTier.PREMIUM]: {
    maxProducts: -1, // -1 means unlimited
    maxTransactionsPerMonth: -1,
    maxUsers: -1,
    maxDevices: -1,
    cloudStorageGB: 100,
    features: {
      advancedReports: true,
      customBranding: true,
      apiAccess: true,
      multiLocation: true,
      barcodeGeneration: true,
      supplierManagement: true,
    },
  },
}

/**
 * Get package limits for a specific tier
 */
export function getPackageLimits(tier: PackageTier): PackageLimits {
  return PACKAGE_LIMITS[tier]
}

/**
 * Check if a feature is available in the package
 */
export function isFeatureAvailable(
  tier: PackageTier,
  feature: keyof PackageLimits['features']
): boolean {
  return PACKAGE_LIMITS[tier].features[feature]
}

/**
 * Check if unlimited (returns true if limit is -1)
 */
export function isUnlimited(limit: number): boolean {
  return limit === -1
}

/**
 * Format limit for display (shows "Unlimited" for -1)
 */
export function formatLimit(limit: number): string {
  return limit === -1 ? 'Unlimited' : limit.toString()
}

/**
 * Get user's current package tier
 * In production, this would come from user's subscription in database
 */
export function getCurrentPackageTier(): PackageTier {
  // Check localStorage first
  const storedTier = localStorage.getItem('packageTier')
  if (storedTier && Object.values(PackageTier).includes(storedTier as PackageTier)) {
    return storedTier as PackageTier
  }

  // Default to BASIC for free trial/demo
  return PackageTier.BASIC
}

/**
 * Set user's package tier
 */
export function setPackageTier(tier: PackageTier): void {
  localStorage.setItem('packageTier', tier)
  console.log(`✅ Package tier set to: ${tier.toUpperCase()}`)
}

/**
 * Validate if action is within package limits
 */
export interface ValidationResult {
  allowed: boolean
  message: string
  currentCount?: number
  limit?: number
}

export function validateProductLimit(currentProductCount: number): ValidationResult {
  const tier = getCurrentPackageTier()
  const limits = getPackageLimits(tier)

  if (isUnlimited(limits.maxProducts)) {
    return {
      allowed: true,
      message: 'Unlimited products available',
    }
  }

  if (currentProductCount >= limits.maxProducts) {
    return {
      allowed: false,
      message: `Product limit reached! Your ${tier.toUpperCase()} package allows up to ${limits.maxProducts} products. Upgrade to add more.`,
      currentCount: currentProductCount,
      limit: limits.maxProducts,
    }
  }

  return {
    allowed: true,
    message: `${limits.maxProducts - currentProductCount} products remaining`,
    currentCount: currentProductCount,
    limit: limits.maxProducts,
  }
}

export function validateTransactionLimit(currentMonthTransactions: number): ValidationResult {
  const tier = getCurrentPackageTier()
  const limits = getPackageLimits(tier)

  if (isUnlimited(limits.maxTransactionsPerMonth)) {
    return {
      allowed: true,
      message: 'Unlimited transactions available',
    }
  }

  if (currentMonthTransactions >= limits.maxTransactionsPerMonth) {
    return {
      allowed: false,
      message: `Monthly transaction limit reached! Your ${tier.toUpperCase()} package allows ${limits.maxTransactionsPerMonth} transactions/month. Upgrade for more.`,
      currentCount: currentMonthTransactions,
      limit: limits.maxTransactionsPerMonth,
    }
  }

  return {
    allowed: true,
    message: `${limits.maxTransactionsPerMonth - currentMonthTransactions} transactions remaining this month`,
    currentCount: currentMonthTransactions,
    limit: limits.maxTransactionsPerMonth,
  }
}

/**
 * Get upgrade recommendation message
 */
export function getUpgradeMessage(currentTier: PackageTier): string {
  switch (currentTier) {
    case PackageTier.BASIC:
      return '📈 Upgrade to MEDIUM (K8,000) for 2,000 products and advanced features!'
    case PackageTier.MEDIUM:
      return '🚀 Upgrade to PREMIUM (K18,000) for unlimited everything!'
    case PackageTier.PREMIUM:
      return '✨ You have the best package! Enjoy unlimited features!'
    default:
      return 'Contact us to upgrade your package'
  }
}

/**
 * Package information for display
 */
export interface PackageInfo {
  tier: PackageTier
  name: string
  price: number
  limits: PackageLimits
  upgradeMessage: string
}

export function getCurrentPackageInfo(): PackageInfo {
  const tier = getCurrentPackageTier()
  const limits = getPackageLimits(tier)

  const prices = {
    [PackageTier.BASIC]: 3000,
    [PackageTier.MEDIUM]: 8000,
    [PackageTier.PREMIUM]: 18000,
  }

  const names = {
    [PackageTier.BASIC]: 'Basic Package',
    [PackageTier.MEDIUM]: 'Medium Package',
    [PackageTier.PREMIUM]: 'Premium Package',
  }

  return {
    tier,
    name: names[tier],
    price: prices[tier],
    limits,
    upgradeMessage: getUpgradeMessage(tier),
  }
}
