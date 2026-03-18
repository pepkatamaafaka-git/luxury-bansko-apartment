import { createClient } from '@supabase/supabase-js'

// ─── Database types ───────────────────────────────────────────────────────────
export type BookingSource = 'manual' | 'booking' | 'airbnb' | 'stripe'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled'

export interface Booking {
  id: string
  start_date: string        // YYYY-MM-DD
  end_date: string          // YYYY-MM-DD
  note: string
  source: BookingSource
  status: BookingStatus
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  guests_count: number | null
  total_price: number | null
  stripe_session_id: string | null
  created_at: string
}

export interface PricingRule {
  id: string
  label: string
  months: number[]          // 0-indexed (0 = Jan, 11 = Dec)
  weekday_price: number     // EUR per night
  weekend_price: number     // EUR per night  (Fri + Sat + Sun)
  updated_at: string
}

type BookingInsert = Omit<Booking, 'id' | 'created_at'>
type BookingUpdate = Partial<Omit<Booking, 'id' | 'created_at'>>
type PricingRuleInsert = Omit<PricingRule, 'id' | 'updated_at'>
type PricingRuleUpdate = Partial<Omit<PricingRule, 'id' | 'updated_at'>>

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          start_date: string
          end_date: string
          note: string
          source: BookingSource
          status: BookingStatus
          guest_name: string | null
          guest_email: string | null
          guest_phone: string | null
          guests_count: number | null
          total_price: number | null
          stripe_session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string | undefined
          start_date: string
          end_date: string
          note?: string | undefined
          source?: BookingSource | undefined
          status?: BookingStatus | undefined
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guests_count?: number | null
          total_price?: number | null
          stripe_session_id?: string | null
          created_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          start_date?: string | undefined
          end_date?: string | undefined
          note?: string | undefined
          source?: BookingSource | undefined
          status?: BookingStatus | undefined
          guest_name?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guests_count?: number | null
          total_price?: number | null
          stripe_session_id?: string | null
          created_at?: string | undefined
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          id: string
          label: string
          months: number[]
          weekday_price: number
          weekend_price: number
          updated_at: string
        }
        Insert: {
          id?: string | undefined
          label: string
          months: number[]
          weekday_price: number
          weekend_price: number
          updated_at?: string | undefined
        }
        Update: {
          id?: string | undefined
          label?: string | undefined
          months?: number[] | undefined
          weekday_price?: number | undefined
          weekend_price?: number | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Client factories ─────────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Public client — respects RLS, safe to use client-side. */
export const supabase = createClient<Database>(url, anonKey)

/**
 * Server-only admin client — bypasses RLS.
 * NEVER call this function from a Client Component.
 */
export function createServerClient() {
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  })
}
