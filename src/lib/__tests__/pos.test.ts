import { POSService } from '@/lib/pos'
import { Product, CartItem } from '@/types/schemas'

describe('POSService', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    price: 100.0,
    sku: 'TEST001',
    image: 'https://example.com/image.png',
  }

  const mockCartItem: CartItem = {
    id: 1,
    name: 'Test Product',
    price: 100.0,
    quantity: 1,
  }

  describe('addToCart', () => {
    it('should add a new product to an empty cart', () => {
      const cart: CartItem[] = []
      const result = POSService.addToCart(cart, mockProduct)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        quantity: 1,
      })
    })

    it('should increment quantity if product already exists in cart', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.addToCart(cart, mockProduct)

      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(2)
    })

    it('should throw error for invalid product', () => {
      const invalidProduct = { ...mockProduct, price: -10 }
      expect(() => POSService.addToCart([], invalidProduct as Product)).toThrow()
    })
  })

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.removeFromCart(cart, mockProduct.id)

      expect(result).toHaveLength(0)
    })

    it('should not affect cart if product not found', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.removeFromCart(cart, 999)

      expect(result).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should increment quantity', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.updateQuantity(cart, mockProduct.id, 1)

      expect(result[0].quantity).toBe(2)
    })

    it('should decrement quantity', () => {
      const cart: CartItem[] = [{ ...mockCartItem, quantity: 2 }]
      const result = POSService.updateQuantity(cart, mockProduct.id, -1)

      expect(result[0].quantity).toBe(1)
    })

    it('should remove item when quantity reaches 0', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.updateQuantity(cart, mockProduct.id, -1)

      expect(result).toHaveLength(0)
    })
  })

  describe('calculateTotals', () => {
    it('should calculate correct totals with default tax rate', () => {
      const cart: CartItem[] = [
        { id: 1, name: 'Product 1', price: 100, quantity: 2 },
        { id: 2, name: 'Product 2', price: 50, quantity: 1 },
      ]

      const result = POSService.calculateTotals(cart)

      expect(result.subtotal).toBe(250)
      expect(result.tax).toBe(40) // 16% of 250
      expect(result.total).toBe(290)
    })

    it('should calculate correct totals with custom tax rate', () => {
      const cart: CartItem[] = [{ id: 1, name: 'Product 1', price: 100, quantity: 1 }]

      const result = POSService.calculateTotals(cart, 0.2)

      expect(result.subtotal).toBe(100)
      expect(result.tax).toBe(20)
      expect(result.total).toBe(120)
    })

    it('should return zero totals for empty cart', () => {
      const result = POSService.calculateTotals([])

      expect(result.subtotal).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.total).toBe(0)
    })
  })

  describe('searchProducts', () => {
    const products: Product[] = [
      { id: 1, name: 'Paracetamol', price: 45, sku: 'MED001' },
      { id: 2, name: 'Multivitamins', price: 120, sku: 'SUP002' },
      { id: 3, name: 'Alcohol Swabs', price: 35, sku: 'FIRST03' },
    ]

    it('should filter products by name', () => {
      const result = POSService.searchProducts(products, 'para')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Paracetamol')
    })

    it('should filter products by SKU', () => {
      const result = POSService.searchProducts(products, 'SUP')
      expect(result).toHaveLength(1)
      expect(result[0].sku).toBe('SUP002')
    })

    it('should be case insensitive', () => {
      const result = POSService.searchProducts(products, 'ALCOHOL')
      expect(result).toHaveLength(1)
    })

    it('should return all products for empty search', () => {
      const result = POSService.searchProducts(products, '')
      expect(result).toHaveLength(3)
    })

    it('should return empty array for no matches', () => {
      const result = POSService.searchProducts(products, 'nonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('validateCart', () => {
    it('should validate a valid cart', () => {
      const cart: CartItem[] = [mockCartItem]
      const result = POSService.validateCart(cart)

      expect(result.valid).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('should reject empty cart', () => {
      const result = POSService.validateCart([])

      expect(result.valid).toBe(false)
      expect(result.message).toBe('Cart is empty')
    })

    it('should reject cart with invalid items', () => {
      const invalidCart: CartItem[] = [{ ...mockCartItem, quantity: 0 }]
      const result = POSService.validateCart(invalidCart)

      expect(result.valid).toBe(false)
      expect(result.message).toContain('Invalid item')
    })
  })

  describe('ID generation', () => {
    it('should generate transaction IDs with SALE prefix', () => {
      const id = POSService.generateTransactionId()
      expect(id).toMatch(/^SALE-\d{7}$/)
    })

    it('should generate unique transaction IDs', () => {
      const id1 = POSService.generateTransactionId()
      const id2 = POSService.generateTransactionId()
      expect(id1).not.toBe(id2)
    })

    it('should generate quotation IDs with QTE prefix', () => {
      const id = POSService.generateQuotationId()
      expect(id).toMatch(/^QTE-\d{7}$/)
    })
  })

  describe('formatCurrency', () => {
    it('should format numbers as Zambian Kwacha', () => {
      const result = POSService.formatCurrency(100)
      expect(result).toContain('ZMW')
      expect(result).toContain('100')
    })

    it('should format decimal numbers correctly', () => {
      const result = POSService.formatCurrency(45.5)
      expect(result).toContain('45.50')
    })
  })

  describe('clearCart', () => {
    it('should return an empty array', () => {
      const result = POSService.clearCart()
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })
  })
})
