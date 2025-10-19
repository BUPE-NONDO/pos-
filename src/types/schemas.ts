import { z } from 'zod'

/**
 * Product Schema - Validates individual product data
 */
export const ProductSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1, 'Product name is required').max(200),
  price: z.number().positive('Price must be positive'),
  sku: z.string().min(1, 'SKU is required').max(50),
  image: z.string().url().optional(),
})

export type Product = z.infer<typeof ProductSchema>

/**
 * Cart Item Schema - Validates items in the shopping cart
 */
export const CartItemSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
})

export type CartItem = z.infer<typeof CartItemSchema>

/**
 * Transaction Schema - Validates completed sales transactions
 */
export const TransactionSchema = z.object({
  transId: z.string().min(1),
  timestamp: z.string().datetime(),
  totalAmount: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  taxRate: z.number().min(0).max(1),
  items: z.array(CartItemSchema).min(1, 'Transaction must have at least one item'),
  cashierId: z.string().min(1),
  status: z.enum(['Completed', 'Pending', 'Cancelled']),
})

export type Transaction = z.infer<typeof TransactionSchema>

/**
 * Quotation Schema - Validates saved quotations
 */
export const QuotationSchema = z.object({
  quoteId: z.string().min(1),
  timestamp: z.string().datetime(),
  totalAmount: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  taxRate: z.number().min(0).max(1),
  items: z.array(CartItemSchema).min(1, 'Quotation must have at least one item'),
  preparedBy: z.string().min(1),
  status: z.enum(['Quoted', 'Accepted', 'Declined', 'Expired']),
  validUntil: z.string().datetime().optional(),
})

export type Quotation = z.infer<typeof QuotationSchema>

/**
 * POS State Schema - Validates the application state
 */
export const POSStateSchema = z.object({
  cart: z.array(CartItemSchema),
  taxRate: z.number().min(0).max(1),
  cashierId: z.string().optional(),
})

export type POSState = z.infer<typeof POSStateSchema>

/**
 * Calculation Result Schema - Validates cart totals
 */
export const TotalsSchema = z.object({
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
})

export type Totals = z.infer<typeof TotalsSchema>


