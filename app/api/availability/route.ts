import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/availability
 *
 * Returns occupied date ranges so the public calendar can show
 * blocked dates without exposing guest PII.
 *
 * Query params:
 *   from  YYYY-MM-DD  (optional, default: today)
 *   to    YYYY-MM-DD  (optional, default: +18 months)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date().toISOString().split('T')[0]
  const to =
    searchParams.get('to') ??
    (() => {
      const d = new Date()
      d.setMonth(d.getMonth() + 18)
      return d.toISOString().split('T')[0]
    })()

  const db = createServerClient()
  const { data, error } = await db
    .from('bookings')
    .select('start_date, end_date')
    .neq('status', 'cancelled')
    .lt('start_date', to)
    .gt('end_date', from)
    .order('start_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Only expose date ranges — no guest details
  return NextResponse.json(data ?? [], {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
