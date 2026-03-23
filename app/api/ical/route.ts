import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function safeEqual(a: string, b: string): boolean {
  // Hash both to equal-length buffers before comparing to prevent timing side-channels
  const ha = createHmac('sha256', 'ical-cmp').update(a).digest()
  const hb = createHmac('sha256', 'ical-cmp').update(b).digest()
  return timingSafeEqual(ha, hb)
}

/**
 * GET /api/ical?token=<ICAL_EXPORT_TOKEN>
 *
 * Exports all confirmed bookings as a standard iCal (.ics) feed.
 * Give this URL to Booking.com so it can import your occupancy:
 *   https://bansko-apartment.com/api/ical?token=YOUR_ICAL_EXPORT_TOKEN
 *
 * Set ICAL_EXPORT_TOKEN in your environment variables to any long random string.
 * Summary is intentionally generic ("Reserved") to avoid exposing guest data.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  const expectedToken = process.env.ICAL_EXPORT_TOKEN
  if (!token || !expectedToken || !safeEqual(token, expectedToken)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const db = createServerClient()

  const today = new Date().toISOString().split('T')[0]
  const futureDate = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 24)
    return d.toISOString().split('T')[0]
  })()

  // Export only manual/stripe bookings — NOT source='booking' or 'airbnb'.
  // Booking.com already knows about its own reservations; exporting them back
  // would create a circular sync and cause Booking.com to double-block dates.
  const { data, error } = await db
    .from('bookings')
    .select('id, start_date, end_date')
    .neq('status', 'cancelled')
    .in('source', ['manual', 'stripe'])
    .lt('start_date', futureDate)
    .gt('end_date', today)
    .order('start_date', { ascending: true })

  if (error) return new NextResponse('Internal Error', { status: 500 })

  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const events = (data ?? [])
    .map(b => {
      const uid = `${b.id}@bansko-apartment.com`
      const dtstart = b.start_date.replace(/-/g, '')
      const dtend = b.end_date.replace(/-/g, '')
      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        'SUMMARY:Reserved',
        'END:VEVENT',
      ].join('\r\n')
    })
    .join('\r\n')

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bansko Apartment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bansko Apartment',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bansko-apartment.ics"',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
