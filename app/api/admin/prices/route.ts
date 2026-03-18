import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'

// ── GET /api/admin/prices  — list all pricing rules ──────────────────────────
export async function GET(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('pricing_rules')
    .select('*')
    .order('updated_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── PUT /api/admin/prices  — bulk-upsert pricing rules ───────────────────────
// Body: Array of { id?: string, label, months, weekday_price, weekend_price }
// Existing rows (with id) are updated; rows without id are inserted.
export async function PUT(req: Request) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an array of pricing rules' }, { status: 400 })
  }

  for (const rule of body) {
    if (
      !rule ||
      typeof rule.label !== 'string' ||
      !Array.isArray(rule.months) ||
      typeof rule.weekday_price !== 'number' ||
      typeof rule.weekend_price !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Each rule must have: label (string), months (number[]), weekday_price (number), weekend_price (number)' },
        { status: 400 },
      )
    }

    if (rule.weekday_price < 0 || rule.weekend_price < 0) {
      return NextResponse.json({ error: 'Prices must be non-negative' }, { status: 400 })
    }
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('pricing_rules')
    .upsert(
      body.map((r: Record<string, unknown>) => ({
        ...(r.id ? { id: r.id as string } : {}),
        label: r.label as string,
        months: r.months as number[],
        weekday_price: r.weekday_price as number,
        weekend_price: r.weekend_price as number,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'id' },
    )
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
