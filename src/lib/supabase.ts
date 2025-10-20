/**
 * Supabase Configuration
 *
 * To set up your Supabase project:
 * 1. Go to https://supabase.com and create a new project
 * 2. Navigate to Project Settings > API
 * 3. Copy your Project URL and anon/public key
 * 4. Create a .env file in the project root with:
 *    VITE_SUPABASE_URL=your_project_url
 *    VITE_SUPABASE_ANON_KEY=your_anon_key
 *
 * Database Schema Required:
 *
 * -- Sales Transactions Table
 * CREATE TABLE sales_transactions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   trans_id TEXT UNIQUE NOT NULL,
 *   timestamp TIMESTAMPTZ DEFAULT NOW(),
 *   total_amount DECIMAL(10,2) NOT NULL,
 *   subtotal DECIMAL(10,2) NOT NULL,
 *   tax DECIMAL(10,2) NOT NULL,
 *   tax_rate DECIMAL(4,3) NOT NULL,
 *   items JSONB NOT NULL,
 *   cashier_id TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Quotations Table
 * CREATE TABLE quotations (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   quote_id TEXT UNIQUE NOT NULL,
 *   timestamp TIMESTAMPTZ DEFAULT NOW(),
 *   total_amount DECIMAL(10,2) NOT NULL,
 *   subtotal DECIMAL(10,2) NOT NULL,
 *   tax DECIMAL(10,2) NOT NULL,
 *   tax_rate DECIMAL(4,3) NOT NULL,
 *   items JSONB NOT NULL,
 *   prepared_by TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   valid_until TIMESTAMPTZ,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Indexes for Performance
 * CREATE INDEX idx_sales_trans_id ON sales_transactions(trans_id);
 * CREATE INDEX idx_sales_timestamp ON sales_transactions(timestamp DESC);
 * CREATE INDEX idx_quotes_quote_id ON quotations(quote_id);
 * CREATE INDEX idx_quotes_timestamp ON quotations(timestamp DESC);
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client (singleton pattern)
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null
}

// Get connection status message
export const getSupabaseStatus = (): string => {
  if (!supabaseUrl) return 'Supabase URL not configured'
  if (!supabaseAnonKey) return 'Supabase Anon Key not configured'
  return 'Connected to Supabase'
}

/**
 * Database type definitions for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      sales_transactions: {
        Row: {
          id: string
          trans_id: string
          timestamp: string
          total_amount: number
          subtotal: number
          tax: number
          tax_rate: number
          items: any[]
          cashier_id: string
          status: string
          created_at: string
        }
        Insert: {
          trans_id: string
          timestamp?: string
          total_amount: number
          subtotal: number
          tax: number
          tax_rate: number
          items: any[]
          cashier_id: string
          status: string
        }
      }
      quotations: {
        Row: {
          id: string
          quote_id: string
          timestamp: string
          total_amount: number
          subtotal: number
          tax: number
          tax_rate: number
          items: any[]
          prepared_by: string
          status: string
          valid_until: string | null
          created_at: string
        }
        Insert: {
          quote_id: string
          timestamp?: string
          total_amount: number
          subtotal: number
          tax: number
          tax_rate: number
          items: any[]
          prepared_by: string
          status: string
          valid_until?: string
        }
      }
    }
  }
}
