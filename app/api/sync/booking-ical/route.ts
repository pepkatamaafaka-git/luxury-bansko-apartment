import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/sync/booking-ical
 *
 * Fetches the Booking.com iCal feed, parses VEVENT entries,
 * and upserts them into the `bookings` table with source='booking'.
 *
 * Set BOOKING_ICAL_URL in .env.local:
 *   BOOKING_ICAL_URL=https://ical.booking.com/v1/export?t=...
 *
 * Call this endpoint via a cron job (e.g., every 15 minutes) or
 * manually to pull the latest occupancy from Booking.com.
 *
 * Requires the Authorization header to match ADMIN_JWT_SECRET
 * (or just protect it with a simple API key).
 */
export async function GET(req: Request) {
  // Basic auth via secret header
  const secret = req.headers.get('x-sync-secret')
  if (!secret || secret !== process.env.ICAL_SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const icalUrl = process.env.BOOKING_ICAL_URL
  if (!icalUrl) {
    return NextResponse.json({ error: 'BOOKING_ICAL_URL is not configured' }, { status: 500 })
  }

  // Fetch the iCal file
  let icalText: string
  try {
    const res = await fetch(icalUrl, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    icalText = await res.text()
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch iCal: ${err}` }, { status: 502 })
  }

  // Parse VEVENT blocks
  const events = parseICalEvents(icalText)
  if (events.length === 0) {
    return NextResponse.json({ synced: 0, message: 'No events found in iCal feed' })
  }

  const db = createServerClient()
  let synced = 0
  let skipped = 0

  for (const ev of events) {
    if (!ev.start || !ev.end) { skipped++; continue }

    // Check if a booking from Booking.com already covers exactly these dates
    const { data: existing } = await db
      .from('bookings')
      .select('id')
      .eq('source', 'booking')
      .eq('start_date', ev.start)
      .eq('end_date', ev.end)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existing) { skipped++; continue }

    // Also skip if overlapping with a confirmed stripe/manual booking
    const { data: conflict } = await db
      .from('bookings')
      .select('id')
      .neq('status', 'cancelled')
      .neq('source', 'booking')
      .lt('start_date', ev.end)
      .gt('end_date', ev.start)
      .maybeSingle()

    if (conflict) { skipped++; continue }

    await db.from('bookings').insert({
      start_date: ev.start,
      end_date: ev.end,
      note: ev.summary ?? 'Booking.com reservation',
      source: 'booking',
      status: 'confirmed',
      guest_name: null,
      guest_email: null,
      guest_phone: null,
      guests_count: null,
      total_price: null,
      stripe_session_id: null,
    })
    synced++
  }

  return NextResponse.json({ synced, skipped, total: events.length })
}

// ─── Minimal iCal parser ──────────────────────────────────────────────────────
interface ICalEvent {
  start: string | null   // YYYY-MM-DD
  end: string | null     // YYYY-MM-DD
  summary: string | null
}

function parseICalEvents(ical: string): ICalEvent[] {
  const events: ICalEvent[] = []
  const lines = ical.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  let inEvent = false
  let current: ICalEvent = { start: null, end: null, summary: null }

  for (const raw of lines) {
    const line = raw.trim()

    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = { start: null, end: null, summary: null }
      continue
    }

    if (line === 'END:VEVENT') {
      inEvent = false
      events.push(current)
      continue
    }

    if (!inEvent) continue

    if (line.startsWith('DTSTART')) {
      current.start = parseICalDate(line)
    } else if (line.startsWith('DTEND')) {
      current.end = parseICalDate(line)
    } else if (line.startsWith('SUMMARY')) {
      current.summary = line.split(':').slice(1).join(':').trim() || null
    }
  }

  return events
}

/** Converts iCal date formats (YYYYMMDD or YYYYMMDDTHHMMSSZ) to YYYY-MM-DD */
function parseICalDate(line: string): string | null {
  // DTSTART;VALUE=DATE:20260115  or  DTSTART:20260115T000000Z
  const value = line.split(':').pop()?.trim() ?? ''
  // Take first 8 chars — the date part YYYYMMDD
  const raw = value.slice(0, 8)
  if (raw.length !== 8 || isNaN(Number(raw))) return null
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}
