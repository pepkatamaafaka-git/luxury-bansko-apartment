import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calcStayTotal, countNights, DEFAULT_PRICING_RULES } from '@/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * POST /api/checkout
 *
 * Body:
 *   checkIn     string   YYYY-MM-DD  (check-in date)
 *   checkOut    string   YYYY-MM-DD  (check-out date)
 *   guestName   string
 *   guestEmail  string
 *   guestPhone? string
 *   guests?     number
 *
 * Returns: { url: string }  — Stripe Checkout redirect URL
 */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { checkIn, checkOut, guestName, guestEmail, guestPhone, guests_count } =
    (body as Record<string, unknown>) ?? {}
  const guestsCount = typeof guests_count === 'number' ? Math.min(5, Math.max(1, Math.round(guests_count))) : 2

  // ── Input validation ────────────────────────────────────────────────────────
  if (typeof checkIn !== 'string' || typeof checkOut !== 'string') {
    return NextResponse.json({ error: 'checkIn and checkOut are required (YYYY-MM-DD)' }, { status: 400 })
  }
  if (checkIn >= checkOut) {
    return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
  }
  if (typeof guestName !== 'string' || guestName.trim().length === 0) {
    return NextResponse.json({ error: 'guestName is required' }, { status: 400 })
  }
  if (typeof guestEmail !== 'string' || !guestEmail.includes('@')) {
    return NextResponse.json({ error: 'A valid guestEmail is required' }, { status: 400 })
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const nights = countNights(checkInDate, checkOutDate)

  if (nights < 1) {
    return NextResponse.json({ error: 'Minimum stay is 1 night' }, { status: 400 })
  }

  const db = createServerClient()

  // ── Check for date conflicts ────────────────────────────────────────────────
  const { data: conflicts } = await db
    .from('bookings')
    .select('id')
    .neq('status', 'cancelled')
    .lt('start_date', checkOut)
    .gt('end_date', checkIn)

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: 'Selected dates are no longer available. Please choose different dates.' },
      { status: 409 },
    )
  }

  // ── Server-side price calculation ───────────────────────────────────────────
  const { data: rulesData } = await db.from('pricing_rules').select('*')
  const rules = rulesData && rulesData.length > 0 ? rulesData : DEFAULT_PRICING_RULES

  const totalEUR = calcStayTotal(checkInDate, checkOutDate, rules, guestsCount)
  const totalCents = Math.round(totalEUR * 100) // Stripe uses smallest currency unit

  // ── Create a pending booking to hold the dates ──────────────────────────────
  const { data: booking, error: bookingError } = await db
    .from('bookings')
    .insert({
      start_date: checkIn,
      end_date: checkOut,
      note: `Online reservation — ${nights} night${nights > 1 ? 's' : ''}`,
      source: 'stripe',
      status: 'pending',
      guest_name: guestName.trim(),
      guest_email: guestEmail.toLowerCase().trim(),
      guest_phone: typeof guestPhone === 'string' ? guestPhone.trim() : null,
      guests_count: guestsCount,
      total_price: totalEUR,
      stripe_session_id: null,
    })
    .select()
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // ── Create Stripe Checkout session ─────────────────────────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: guestEmail.toLowerCase().trim(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: totalCents,
            product_data: {
              name: `Bansko Apartment — ${nights} Night Stay`,
              description: [
                `Check-in: ${checkIn}`,
                `Check-out: ${checkOut}`,
                `${nights} night${nights > 1 ? 's' : ''}`,
                `${guestsCount} guest${guestsCount > 1 ? 's' : ''}`,
              ].join(' · '),
              images: [`${APP_URL}/og-image.jpg`],           // add a real image to /public
            },
          },
        },
      ],
      metadata: {
        booking_id: booking.id,
        check_in: checkIn,
        check_out: checkOut,
        guest_name: guestName.trim(),
        nights: String(nights),
      },
      payment_intent_data: {
        metadata: { booking_id: booking.id },
      },
      success_url: `${APP_URL}/reserve?success=true&booking_id=${booking.id}`,
      cancel_url: `${APP_URL}/reserve?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // session expires in 30 min
    })

    // Attach the Stripe session ID to the pending booking
    await db
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    // Clean up the pending booking so dates are freed
    await db.from('bookings').delete().eq('id', booking.id)
    // Log full error server-side ONLY — never expose to client
    console.error('[checkout] Stripe error:', err)
    return NextResponse.json(
      { error: 'Payment service unavailable. Please try again shortly.' },
      { status: 502 },
    )
  }
}
