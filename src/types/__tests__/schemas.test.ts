import {
  ProductSchema,
  CartItemSchema,
  TransactionSchema,
  QuotationSchema,
  POSStateSchema,
  TotalsSchema,
} from '@/types/schemas'

describe('Zod Schema Validation', () => {
  describe('ProductSchema', () => {
    it('should validate a valid product', () => {
      const validProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        sku: 'TEST001',
        image: 'https://example.com/image.png',
      }

      const result = ProductSchema.safeParse(validProduct)
      expect(result.success).toBe(true)
    })

    it('should accept product without image', () => {
      const product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        sku: 'TEST001',
      }

      const result = ProductSchema.safeParse(product)
      expect(result.success).toBe(true)
    })

    it('should reject negative price', () => {
      const product = {
        id: 1,
        name: 'Test Product',
        price: -10,
        sku: 'TEST001',
      }

      const result = ProductSchema.safeParse(product)
      expect(result.success).toBe(false)
    })

    it('should reject empty name', () => {
      const product = {
        id: 1,
        name: '',
        price: 99.99,
        sku: 'TEST001',
      }

      const result = ProductSchema.safeParse(product)
      expect(result.success).toBe(false)
    })

    it('should reject invalid image URL', () => {
      const product = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        sku: 'TEST001',
        image: 'not-a-url',
      }

      const result = ProductSchema.safeParse(product)
      expect(result.success).toBe(false)
    })
  })

  describe('CartItemSchema', () => {
    it('should validate a valid cart item', () => {
      const validItem = {
        id: 1,
        name: 'Test Product',
        price: 50.0,
        quantity: 2,
      }

      const result = CartItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })

    it('should reject zero quantity', () => {
      const item = {
        id: 1,
        name: 'Test Product',
        price: 50.0,
        quantity: 0,
      }

      const result = CartItemSchema.safeParse(item)
      expect(result.success).toBe(false)
    })

    it('should reject negative quantity', () => {
      const item = {
        id: 1,
        name: 'Test Product',
        price: 50.0,
        quantity: -1,
      }

      const result = CartItemSchema.safeParse(item)
      expect(result.success).toBe(false)
    })

    it('should reject decimal quantity', () => {
      const item = {
        id: 1,
        name: 'Test Product',
        price: 50.0,
        quantity: 1.5,
      }

      const result = CartItemSchema.safeParse(item)
      expect(result.success).toBe(false)
    })
  })

  describe('TransactionSchema', () => {
    it('should validate a valid transaction', () => {
      const validTransaction = {
        transId: 'SALE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 290.0,
        subtotal: 250.0,
        tax: 40.0,
        taxRate: 0.16,
        items: [
          { id: 1, name: 'Product 1', price: 100, quantity: 2 },
          { id: 2, name: 'Product 2', price: 50, quantity: 1 },
        ],
        cashierId: 'CASHIER_123',
        status: 'Completed',
      }

      const result = TransactionSchema.safeParse(validTransaction)
      expect(result.success).toBe(true)
    })

    it('should reject transaction without items', () => {
      const transaction = {
        transId: 'SALE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 0,
        subtotal: 0,
        tax: 0,
        taxRate: 0.16,
        items: [],
        cashierId: 'CASHIER_123',
        status: 'Completed',
      }

      const result = TransactionSchema.safeParse(transaction)
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const transaction = {
        transId: 'SALE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 100,
        subtotal: 100,
        tax: 0,
        taxRate: 0,
        items: [{ id: 1, name: 'Product', price: 100, quantity: 1 }],
        cashierId: 'CASHIER_123',
        status: 'InvalidStatus',
      }

      const result = TransactionSchema.safeParse(transaction)
      expect(result.success).toBe(false)
    })

    it('should reject negative amounts', () => {
      const transaction = {
        transId: 'SALE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: -100,
        subtotal: -100,
        tax: 0,
        taxRate: 0.16,
        items: [{ id: 1, name: 'Product', price: 100, quantity: 1 }],
        cashierId: 'CASHIER_123',
        status: 'Completed',
      }

      const result = TransactionSchema.safeParse(transaction)
      expect(result.success).toBe(false)
    })
  })

  describe('QuotationSchema', () => {
    it('should validate a valid quotation', () => {
      const validQuotation = {
        quoteId: 'QTE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 290.0,
        subtotal: 250.0,
        tax: 40.0,
        taxRate: 0.16,
        items: [{ id: 1, name: 'Product', price: 250, quantity: 1 }],
        preparedBy: 'CASHIER_123',
        status: 'Quoted',
        validUntil: new Date().toISOString(),
      }

      const result = QuotationSchema.safeParse(validQuotation)
      expect(result.success).toBe(true)
    })

    it('should accept quotation without validUntil', () => {
      const quotation = {
        quoteId: 'QTE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 290.0,
        subtotal: 250.0,
        tax: 40.0,
        taxRate: 0.16,
        items: [{ id: 1, name: 'Product', price: 250, quantity: 1 }],
        preparedBy: 'CASHIER_123',
        status: 'Quoted',
      }

      const result = QuotationSchema.safeParse(quotation)
      expect(result.success).toBe(true)
    })

    it('should reject invalid quotation status', () => {
      const quotation = {
        quoteId: 'QTE-1234567',
        timestamp: new Date().toISOString(),
        totalAmount: 100,
        subtotal: 100,
        tax: 0,
        taxRate: 0,
        items: [{ id: 1, name: 'Product', price: 100, quantity: 1 }],
        preparedBy: 'CASHIER_123',
        status: 'InvalidStatus',
      }

      const result = QuotationSchema.safeParse(quotation)
      expect(result.success).toBe(false)
    })
  })

  describe('POSStateSchema', () => {
    it('should validate valid POS state', () => {
      const validState = {
        cart: [{ id: 1, name: 'Product', price: 100, quantity: 1 }],
        taxRate: 0.16,
        cashierId: 'CASHIER_123',
      }

      const result = POSStateSchema.safeParse(validState)
      expect(result.success).toBe(true)
    })

    it('should accept state without cashierId', () => {
      const state = {
        cart: [],
        taxRate: 0.16,
      }

      const result = POSStateSchema.safeParse(state)
      expect(result.success).toBe(true)
    })

    it('should reject invalid tax rate', () => {
      const state = {
        cart: [],
        taxRate: 1.5, // > 100%
        cashierId: 'CASHIER_123',
      }

      const result = POSStateSchema.safeParse(state)
      expect(result.success).toBe(false)
    })
  })

  describe('TotalsSchema', () => {
    it('should validate valid totals', () => {
      const validTotals = {
        subtotal: 100,
        tax: 16,
        total: 116,
      }

      const result = TotalsSchema.safeParse(validTotals)
      expect(result.success).toBe(true)
    })

    it('should reject negative totals', () => {
      const totals = {
        subtotal: -100,
        tax: 16,
        total: -84,
      }

      const result = TotalsSchema.safeParse(totals)
      expect(result.success).toBe(false)
    })

    it('should accept zero totals', () => {
      const totals = {
        subtotal: 0,
        tax: 0,
        total: 0,
      }

      const result = TotalsSchema.safeParse(totals)
      expect(result.success).toBe(true)
    })
  })
})
