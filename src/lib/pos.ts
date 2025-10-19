import { CartItem, Totals, Product } from '@/types/schemas'
import { CartItemSchema, ProductSchema } from '@/types/schemas'

/**
 * POS Business Logic Layer
 * All core POS operations with validation and error handling
 */

export class POSService {
  /**
   * Zambian Kwacha currency formatter
   */
  static readonly ZMW_FORMAT = new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
  })

  /**
   * Generate a unique transaction ID
   */
  static generateTransactionId(): string {
    return 'SALE-' + (Math.floor(Math.random() * 9000000) + 1000000).toString()
  }

  /**
   * Generate a unique quotation ID
   */
  static generateQuotationId(): string {
    return 'QTE-' + (Math.floor(Math.random() * 9000000) + 1000000).toString()
  }

  /**
   * Generate a random cashier ID (for demo - in production this would come from auth)
   */
  static generateCashierId(): string {
    return 'CASHIER_' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  /**
   * Add a product to the cart or increment quantity if it exists
   * @param cart - Current cart state
   * @param product - Product to add
   * @returns Updated cart
   */
  static addToCart(cart: CartItem[], product: Product): CartItem[] {
    // Validate product
    const productValidation = ProductSchema.safeParse(product)
    if (!productValidation.success) {
      throw new Error('Invalid product data')
    }

    const existingItem = cart.find(item => item.id === product.id)

    if (existingItem) {
      // Increment quantity
      return cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }

      // Validate cart item
      const itemValidation = CartItemSchema.safeParse(newItem)
      if (!itemValidation.success) {
        throw new Error('Invalid cart item: ' + itemValidation.error.message)
      }

      return [...cart, newItem]
    }
  }

  /**
   * Remove an item from the cart
   * @param cart - Current cart state
   * @param productId - ID of product to remove
   * @returns Updated cart
   */
  static removeFromCart(cart: CartItem[], productId: number): CartItem[] {
    return cart.filter(item => item.id !== productId)
  }

  /**
   * Update the quantity of a cart item
   * @param cart - Current cart state
   * @param productId - ID of product to update
   * @param change - Change in quantity (+1 or -1)
   * @returns Updated cart
   */
  static updateQuantity(cart: CartItem[], productId: number, change: number): CartItem[] {
    return cart
      .map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change
          if (newQuantity <= 0) {
            return null // Will be filtered out
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
      .filter((item): item is CartItem => item !== null)
  }

  /**
   * Calculate totals from cart
   * @param cart - Current cart state
   * @param taxRate - Tax rate (default 0.16 for Zambian VAT)
   * @returns Calculated totals
   */
  static calculateTotals(cart: CartItem[], taxRate = 0.16): Totals {
    const subtotal = cart.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    const tax = subtotal * taxRate
    const total = subtotal + tax

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    }
  }

  /**
   * Search/filter products by name or SKU
   * @param products - All products
   * @param searchTerm - Search query
   * @returns Filtered products
   */
  static searchProducts(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm) return products

    const query = searchTerm.toLowerCase().trim()
    return products.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    )
  }

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @returns Formatted string
   */
  static formatCurrency(amount: number): string {
    return this.ZMW_FORMAT.format(amount)
  }

  /**
   * Validate cart before checkout
   * @param cart - Cart to validate
   * @returns Validation result
   */
  static validateCart(cart: CartItem[]): { valid: boolean; message?: string } {
    if (cart.length === 0) {
      return { valid: false, message: 'Cart is empty' }
    }

    // Validate each item
    for (const item of cart) {
      const validation = CartItemSchema.safeParse(item)
      if (!validation.success) {
        return {
          valid: false,
          message: `Invalid item: ${item.name} - ${validation.error.message}`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Clear the entire cart
   * @returns Empty cart
   */
  static clearCart(): CartItem[] {
    return []
  }
}


