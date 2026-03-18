import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendBookingConfirmation } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends events here. Must be registered in Stripe dashboard:
 *   Developers → Webhooks → Add endpoint → https://your-domain.com/api/webhooks/stripe
 *
 * Events handled:
 *   checkout.session.completed  → confirm the booking
 *   checkout.session.expired    → cancel the pending booking (free dates)
 */
export async function POST(req: Request) {
  // Stripe requires the raw body for signature verification — never parse as JSON first
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('[stripe-webhook] Signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const db = createServerClient()

  try {
    switch (event.type) {
      // ── Payment succeeded ─────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id

        if (!bookingId) {
          console.error('[stripe-webhook] No booking_id in session metadata', session.id)
          break
        }

        // Confirm the booking and record guest contact
        await db
          .from('bookings')
          .update({
            status: 'confirmed' as const,
            stripe_session_id: session.id,
            guest_email: session.customer_email ?? undefined,
          })
          .eq('id', bookingId)

        // Send email receipt via Resend
        try {
          const { data: booking } = await db
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()
          if (booking) await sendBookingConfirmation(booking)
        } catch (emailErr) {
          console.error('[stripe-webhook] Email send failed:', emailErr)
        }

        console.log(`[stripe-webhook] Booking ${bookingId} confirmed via session ${session.id}`)
        break
      }

      // ── Checkout expired (user did not pay in 30 min) ──────────────────────
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.booking_id

        if (!bookingId) break

        // Cancel the pending booking so the dates are freed
        await db
          .from('bookings')
          .update({ status: 'cancelled' as const })
          .eq('id', bookingId)
          .eq('status', 'pending') // only if still pending, don't overwrite a confirmed one

        console.log(`[stripe-webhook] Booking ${bookingId} cancelled (checkout expired)`)
        break
      }

      // ── Payment refunded ───────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntent = charge.payment_intent as string | null

        if (!paymentIntent) break

        // Look up the booking by matching the Stripe session that produced this payment intent
        const { data: sessions } = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent,
          limit: 1,
        }) as unknown as { data: Stripe.Checkout.Session[] }

        const sessionId = sessions?.[0]?.id
        if (!sessionId) break

        await db
          .from('bookings')
          .update({ status: 'cancelled' as const })
          .eq('stripe_session_id', sessionId)

        console.log(`[stripe-webhook] Booking for session ${sessionId} cancelled (refund)`)
        break
      }

      default:
        // Unhandled event — respond 200 so Stripe doesn't retry
        break
    }
  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err)
    // Still return 200 to prevent Stripe from retrying; log for investigation
  }

  return NextResponse.json({ received: true })
}
