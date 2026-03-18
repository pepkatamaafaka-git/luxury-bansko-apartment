import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { DEFAULT_PRICING_RULES } from '@/lib/pricing'

/**
 * GET /api/prices
 *
 * Returns all pricing rules for the public-facing calendar/reserve page.
 */
export async function GET() {
  const db = createServerClient()
  const { data, error } = await db
    .from('pricing_rules')
    .select('months, weekday_price, weekend_price, label')
    .order('updated_at', { ascending: true })

  if (error || !data || data.length === 0) {
    // Fall back to hardcoded defaults if DB not seeded yet
    return NextResponse.json(DEFAULT_PRICING_RULES, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
