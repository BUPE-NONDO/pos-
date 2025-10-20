import { supabase, isSupabaseConfigured } from './supabase'
import { Transaction, Quotation, TransactionSchema, QuotationSchema } from '@/types/schemas'

/**
 * Service layer for database operations
 * Handles all CRUD operations with proper validation and error handling
 */

export class DatabaseService {
  /**
   * Save a completed transaction to the database
   * @param transaction - The transaction data to save
   * @returns The saved transaction ID or null on failure
   */
  static async saveTransaction(transaction: Transaction): Promise<string | null> {
    // Validate data before saving
    const validationResult = TransactionSchema.safeParse(transaction)
    if (!validationResult.success) {
      console.error('Transaction validation failed:', validationResult.error)
      throw new Error('Invalid transaction data: ' + validationResult.error.message)
    }

    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured. Transaction saved locally only.')
      return transaction.transId
    }

    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .insert({
          trans_id: transaction.transId,
          timestamp: transaction.timestamp,
          total_amount: transaction.totalAmount,
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          tax_rate: transaction.taxRate,
          items: transaction.items,
          cashier_id: transaction.cashierId,
          status: transaction.status,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Supabase transaction save error:', error)
        throw new Error(`Failed to save transaction: ${error.message}`)
      }

      return data?.id || transaction.transId
    } catch (error) {
      console.error('Error saving transaction:', error)
      throw error
    }
  }

  /**
   * Save a quotation to the database
   * @param quotation - The quotation data to save
   * @returns The saved quotation ID or null on failure
   */
  static async saveQuotation(quotation: Quotation): Promise<string | null> {
    // Validate data before saving
    const validationResult = QuotationSchema.safeParse(quotation)
    if (!validationResult.success) {
      console.error('Quotation validation failed:', validationResult.error)
      throw new Error('Invalid quotation data: ' + validationResult.error.message)
    }

    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured. Quotation saved locally only.')
      return quotation.quoteId
    }

    try {
      // Calculate valid_until (30 days from now)
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)

      const { data, error } = await supabase
        .from('quotations')
        .insert({
          quote_id: quotation.quoteId,
          timestamp: quotation.timestamp,
          total_amount: quotation.totalAmount,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          tax_rate: quotation.taxRate,
          items: quotation.items,
          prepared_by: quotation.preparedBy,
          status: quotation.status,
          valid_until: validUntil.toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.error('Supabase quotation save error:', error)
        throw new Error(`Failed to save quotation: ${error.message}`)
      }

      return data?.id || quotation.quoteId
    } catch (error) {
      console.error('Error saving quotation:', error)
      throw error
    }
  }

  /**
   * Retrieve recent transactions (for reporting/history features)
   * @param limit - Maximum number of transactions to retrieve
   * @returns Array of transactions
   */
  static async getRecentTransactions(limit = 50): Promise<Transaction[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured. Cannot fetch transactions.')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('sales_transactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching transactions:', error)
        return []
      }

      // Transform database format to application format
      return (data || []).map(row => ({
        transId: row.trans_id,
        timestamp: row.timestamp,
        totalAmount: row.total_amount,
        subtotal: row.subtotal,
        tax: row.tax,
        taxRate: row.tax_rate,
        items: row.items,
        cashierId: row.cashier_id,
        status: row.status as 'Completed' | 'Pending' | 'Cancelled',
      }))
    } catch (error) {
      console.error('Error in getRecentTransactions:', error)
      return []
    }
  }

  /**
   * Retrieve recent quotations
   * @param limit - Maximum number of quotations to retrieve
   * @returns Array of quotations
   */
  static async getRecentQuotations(limit = 50): Promise<Quotation[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured. Cannot fetch quotations.')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching quotations:', error)
        return []
      }

      // Transform database format to application format
      return (data || []).map(row => ({
        quoteId: row.quote_id,
        timestamp: row.timestamp,
        totalAmount: row.total_amount,
        subtotal: row.subtotal,
        tax: row.tax,
        taxRate: row.tax_rate,
        items: row.items,
        preparedBy: row.prepared_by,
        status: row.status as 'Quoted' | 'Accepted' | 'Declined' | 'Expired',
        validUntil: row.valid_until,
      }))
    } catch (error) {
      console.error('Error in getRecentQuotations:', error)
      return []
    }
  }
}
