import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient, type BookingSource, type BookingStatus } from '@/lib/supabase'

type RouteContext = { params: Promise<{ id: string }> }

// ── PATCH /api/admin/bookings/[id]  — update note, dates, source, or status ──
export async function PATCH(req: Request, ctx: RouteContext) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates = (body as Record<string, unknown>) ?? {}

  // Validate status if provided
  const validStatuses: BookingStatus[] = ['confirmed', 'pending', 'cancelled']
  if (updates.status && !validStatuses.includes(updates.status as BookingStatus)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  // Validate source if provided
  const validSources: BookingSource[] = ['manual', 'booking', 'airbnb', 'stripe']
  if (updates.source && !validSources.includes(updates.source as BookingSource)) {
    return NextResponse.json({ error: 'Invalid source value' }, { status: 400 })
  }

  // Validate date order if both provided
  if (
    typeof updates.start_date === 'string' &&
    typeof updates.end_date === 'string' &&
    updates.start_date >= updates.end_date
  ) {
    return NextResponse.json({ error: 'end_date must be after start_date' }, { status: 400 })
  }

  // Allow only known fields to be updated
  const allowed: (keyof typeof updates)[] = [
    'start_date',
    'end_date',
    'note',
    'source',
    'status',
    'guest_name',
    'guest_email',
    'guest_phone',
    'total_price',
  ]
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key]
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('bookings')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ── DELETE /api/admin/bookings/[id]  — permanently delete a booking ──────────
export async function DELETE(req: Request, ctx: RouteContext) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await ctx.params

  const db = createServerClient()
  const { error } = await db.from('bookings').delete().eq('id', id)

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
