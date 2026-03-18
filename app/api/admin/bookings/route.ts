import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient, type BookingSource } from '@/lib/supabase'

// ── GET /api/admin/bookings  — list all bookings ──────────────────────────────
export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('bookings')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── POST /api/admin/bookings  — create a manual booking ──────────────────────
export async function POST(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    start_date,
    end_date,
    note,
    source,
    guest_name,
    guest_email,
    guest_phone,
    total_price,
  } = (body as Record<string, unknown>) ?? {}

  if (typeof start_date !== 'string' || typeof end_date !== 'string') {
    return NextResponse.json({ error: 'start_date and end_date are required (YYYY-MM-DD)' }, { status: 400 })
  }

  if (start_date >= end_date) {
    return NextResponse.json({ error: 'end_date must be after start_date' }, { status: 400 })
  }

  const validSources: BookingSource[] = ['manual', 'booking', 'airbnb', 'stripe']
  const resolvedSource: BookingSource = validSources.includes(source as BookingSource)
    ? (source as BookingSource)
    : 'manual'

  const db = createServerClient()

  // Check for date conflicts
  const { data: conflicts } = await db
    .from('bookings')
    .select('id, start_date, end_date')
    .neq('status', 'cancelled')
    .lt('start_date', end_date)
    .gt('end_date', start_date)

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: 'Date range conflicts with an existing booking', conflicts },
      { status: 409 },
    )
  }

  const { data, error } = await db
    .from('bookings')
    .insert({
      start_date,
      end_date,
      note: typeof note === 'string' ? note : '',
      source: resolvedSource,
      status: 'confirmed',
      guest_name: typeof guest_name === 'string' ? guest_name : null,
      guest_email: typeof guest_email === 'string' ? guest_email : null,
      guest_phone: typeof guest_phone === 'string' ? guest_phone : null,
      total_price: typeof total_price === 'number' ? total_price : null,
      stripe_session_id: null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
