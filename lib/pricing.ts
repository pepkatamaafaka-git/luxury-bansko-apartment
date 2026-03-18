import type { PricingRule } from './supabase'

// ─── Fallback rules (used if DB is not yet seeded) ───────────────────────────
export const DEFAULT_PRICING_RULES: Omit<PricingRule, 'id' | 'updated_at'>[] = [
  { label: 'Висок ски сезон (Дек–Фев)', months: [11, 0, 1], weekday_price: 95,  weekend_price: 120 },
  { label: 'Среден сезон (Мар–Апр)',    months: [2, 3],     weekday_price: 75,  weekend_price: 95  },
  { label: 'Извън сезон (Май–Юни, Окт–Ноем)', months: [4, 5, 9, 10], weekday_price: 55, weekend_price: 65 },
  { label: 'Летен сезон (Юли–Сеп)',     months: [6, 7, 8],  weekday_price: 80,  weekend_price: 100 },
]

// ─── Core helpers ─────────────────────────────────────────────────────────────
export function getNightlyRate(
  date: Date,
  rules: Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>[],
): number {
  const month = date.getMonth()
  const dow = date.getDay() // 0 = Sun, 6 = Sat
  const isWeekend = dow === 0 || dow === 5 || dow === 6
  const rule = rules.find(r => r.months.includes(month))
  if (!rule) return isWeekend ? 80 : 60 // absolute fallback
  return isWeekend ? rule.weekend_price : rule.weekday_price
}

/** Guest-count multipliers (1–5 guests). Base price is for 2 guests. */
export const GUEST_MULTIPLIERS: Record<number, number> = {
  1: 0.80,
  2: 1.00,
  3: 1.15,
  4: 1.30,
  5: 1.45,
}

export function getGuestMultiplier(guestsCount: number): number {
  const clamped = Math.min(5, Math.max(1, Math.round(guestsCount)))
  return GUEST_MULTIPLIERS[clamped] ?? 1.0
}

export function calcStayTotal(
  checkIn: Date,
  checkOut: Date,
  rules: Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>[],
  guestsCount = 2,
): number {
  const multiplier = getGuestMultiplier(guestsCount)
  let total = 0
  const cur = new Date(checkIn)
  while (cur < checkOut) {
    total += getNightlyRate(cur, rules)
    cur.setDate(cur.getDate() + 1)
  }
  return Math.round(total * multiplier)
}

export function countNights(checkIn: Date, checkOut: Date): number {
  return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000))
}

/** Returns a per-night breakdown for Stripe line-item description. */
export function buildNightBreakdown(
  checkIn: Date,
  checkOut: Date,
  rules: Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>[],
  guestsCount = 2,
): { nights: number; total: number; minRate: number; maxRate: number } {
  const nights = countNights(checkIn, checkOut)
  const total = calcStayTotal(checkIn, checkOut, rules, guestsCount)
  const multiplier = getGuestMultiplier(guestsCount)
  let min = Infinity, max = -Infinity
  const cur = new Date(checkIn)
  while (cur < checkOut) {
    const r = Math.round(getNightlyRate(cur, rules) * multiplier)
    if (r < min) min = r
    if (r > max) max = r
    cur.setDate(cur.getDate() + 1)
  }
  return { nights, total, minRate: min === Infinity ? 0 : min, maxRate: max === -Infinity ? 0 : max }
}
