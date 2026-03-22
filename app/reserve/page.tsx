'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight, Check, Shield, Lock,
  CreditCard, Info, Users, CalendarDays,
} from 'lucide-react'
import type { PricingRule } from '@/lib/supabase'

// ─── Date utilities ───────────────────────────────────────────
function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfWeek(year: number, month: number) { const r = new Date(year, month, 1).getDay(); return (r + 6) % 7 }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function formatDate(d: Date, lang: 'bg' | 'en') { return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }
function formatShort(d: Date, lang: 'bg' | 'en') { return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'short' }) }
function parseDate(s: string | null): Date | null { if (!s) return null; const d = new Date(s); return isNaN(d.getTime()) ? null : d }

const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const BG_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']
const EN_DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

const GUEST_MULTIPLIERS: Record<number, number> = { 1: 0.80, 2: 1.00, 3: 1.15, 4: 1.30, 5: 1.45 }

function getNightlyRate(date: Date, rules: Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>[]) {
  const m = date.getMonth()
  const dow = date.getDay()
  const isWknd = dow === 5 || dow === 6 || dow === 0
  const rule = rules.find(r => r.months.includes(m))
  if (!rule) return isWknd ? 80 : 60
  return isWknd ? rule.weekend_price : rule.weekday_price
}

function calcTotal(checkIn: Date, checkOut: Date, rules: Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>[], guests: number) {
  let total = 0
  const cur = new Date(checkIn)
  while (cur < checkOut) { total += getNightlyRate(cur, rules); cur.setDate(cur.getDate() + 1) }
  const mult = GUEST_MULTIPLIERS[Math.min(5, Math.max(1, guests))] ?? 1
  return Math.round(total * mult)
}

// ─── Mini calendar ────────────────────────────────────────────
// No hover state — CSS-only hover → no lag
function MiniCalendar({ checkIn, checkOut, onSelect, lang, occupied }: {
  checkIn: Date | null; checkOut: Date | null
  onSelect: (d: Date) => void; lang: 'bg' | 'en'
  occupied: Set<string>
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const MONTHS = lang === 'bg' ? BG_MONTHS : EN_MONTHS
  const DAYS = lang === 'bg' ? BG_DAYS : EN_DAYS
  const days = getDaysInMonth(viewYear, viewMonth)
  const first = getFirstDayOfWeek(viewYear, viewMonth)
  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  const dayStatuses = useMemo(() => {
    const s: Record<number, 'past'|'occupied'|'start'|'end'|'range'|'available'> = {}
    for (let day = 1; day <= days; day++) {
      const d = new Date(viewYear, viewMonth, day)
      if (d < today) { s[day] = 'past'; continue }
      const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      if (occupied.has(k)) { s[day] = 'occupied'; continue }
      if (checkIn && isSameDay(d, checkIn)) { s[day] = 'start'; continue }
      if (checkOut && isSameDay(d, checkOut)) { s[day] = 'end'; continue }
      if (checkIn && checkOut && d > checkIn && d < checkOut) { s[day] = 'range'; continue }
      s[day] = 'available'
    }
    return s
  }, [viewYear, viewMonth, days, today, occupied, checkIn, checkOut])

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (!canPrev) return; if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) } else setViewMonth(m => m-1) }}
          disabled={!canPrev} className="p-2 rounded-full hover:bg-secondary disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
        <p className="font-semibold">{MONTHS[viewMonth]} {viewYear}</p>
        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) } else setViewMonth(m => m+1) }}
          className="p-2 rounded-full hover:bg-secondary transition-colors"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="h-8 flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: first }).map((_, i) => <div key={`p${i}`} className="h-10" />)}
        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
          const s = dayStatuses[day]
          const isStart    = s === 'start'
          const isEnd      = s === 'end'
          const inRange    = s === 'range'
          const isOccupied = s === 'occupied'
          const isPast     = s === 'past'
          const isAvail    = s === 'available'
          return (
            <div
              key={day}
              className={[
                'h-10 flex items-center justify-center text-sm font-medium transition-colors select-none',
                isStart    ? 'bg-primary text-primary-foreground font-bold cursor-pointer rounded-l-xl' : '',
                isEnd      ? 'bg-primary text-primary-foreground font-bold cursor-pointer rounded-r-xl' : '',
                inRange    ? 'bg-primary/10 text-foreground cursor-pointer' : '',
                isAvail    ? 'cursor-pointer hover:bg-primary/15 hover:text-primary' : '',
                isPast     ? 'text-muted-foreground/25 cursor-default' : '',
                isOccupied ? 'bg-red-500/15 text-red-500 cursor-not-allowed line-through' : '',
              ].join(' ')}
              onClick={() => s !== 'past' && s !== 'occupied' && onSelect(new Date(viewYear, viewMonth, day))}
            >{day}</div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary inline-block" />{lang === 'bg' ? 'Избрана' : 'Selected'}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/15 inline-block" />{lang === 'bg' ? 'Период' : 'Range'}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{lang === 'bg' ? 'Заето' : 'Occupied'}</span>
      </div>
    </div>
  )
}

// ─── Pricing table ────────────────────────────────────────────
function PricingTable({ lang, rules }: { lang: 'bg' | 'en'; rules: PricingRule[] }) {
  const DEFAULT_ROWS = [
    { label: lang === 'bg' ? 'Висок ски сезон' : 'Peak Ski Season', weekday: 95, weekend: 120 },
    { label: lang === 'bg' ? 'Среден сезон' : 'Mid Season',         weekday: 75, weekend: 95  },
    { label: lang === 'bg' ? 'Летен сезон' : 'Summer Season',       weekday: 80, weekend: 100 },
    { label: lang === 'bg' ? 'Извън сезон' : 'Off Season',          weekday: 55, weekend: 65  },
  ]
  const rows = rules.length > 0 ? rules.map(r => ({ label: r.label, weekday: r.weekday_price, weekend: r.weekend_price })) : DEFAULT_ROWS
  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
          <span className="text-muted-foreground">{r.label}</span>
          <div className="flex gap-3"><span className="font-semibold">€{r.weekday}</span><span className="font-semibold text-primary">€{r.weekend}</span></div>
        </div>
      ))}
      <div className="flex justify-end gap-3 text-[10px] text-muted-foreground pt-1">
        <span>{lang === 'bg' ? 'Пн–Чт' : 'Mon–Thu'}</span><span>{lang === 'bg' ? 'Пт–Нд' : 'Fri–Sun'}</span>
      </div>
    </div>
  )
}

// ─── Conditions ───────────────────────────────────────────────
function ConditionsPanel({ lang }: { lang: 'bg' | 'en' }) {
  const items = lang === 'bg'
    ? ['Минимален престой: 2 нощи', 'Настаняване: 15:00 · Напускане: 11:00', 'Безплатно анулиране до 14 дни', 'СПА достъп включен', 'Безплатен паркинг']
    : ['Minimum stay: 2 nights', 'Check-in: 15:00 · Check-out: 11:00', 'Free cancellation 14+ days', 'SPA included', 'Free parking']
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Check size={12} className="text-primary shrink-0" />{item}</li>
      ))}
    </ul>
  )
}

// ─── Main inner component ─────────────────────────────────────
function ReserveInner() {
  const params = useSearchParams()
  const { t, lang } = useLang()

  // ── URL params ──
  const [checkIn, setCheckIn] = useState<Date | null>(() => parseDate(params.get('in')))
  const [checkOut, setCheckOut] = useState<Date | null>(() => parseDate(params.get('out')))
  const [guests, setGuests] = useState(() => {
    const v = parseInt(params.get('guests') ?? '2')
    return isNaN(v) ? 2 : Math.min(5, Math.max(1, v))
  })
  const [step, setStep] = useState<1|2|3>(checkIn && checkOut ? 2 : 1)

  // ── Form state ──
  const [form, setForm] = useState({ name: '', email: '' })
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ── URL param feedback ──
  const success = params.get('success') === 'true'
  const cancelled = params.get('cancelled') === 'true'

  // ── API data ──
  const [occupied, setOccupied] = useState<Set<string>>(new Set())
  const [rules, setRules] = useState<PricingRule[]>([])

  useEffect(() => {
    const now = new Date()
    const from = now.toISOString().split('T')[0]
    const to = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString().split('T')[0]
    Promise.all([
      fetch(`/api/availability?from=${from}&to=${to}`).then(r => r.ok ? r.json() : []),
      fetch('/api/prices').then(r => r.ok ? r.json() : []),
    ])
      .then(([ranges, priceRules]: [{ start_date: string; end_date: string }[], PricingRule[]]) => {
        if (Array.isArray(ranges)) {
          const set = new Set<string>()
          for (const range of ranges) {
            const cur = new Date(range.start_date); const end = new Date(range.end_date)
            while (cur < end) { set.add(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1) }
          }
          setOccupied(set)
        }
        if (Array.isArray(priceRules) && priceRules.length > 0) setRules(priceRules)
      })
      .catch(() => {})
  }, [])

  // ── Derived values ──
  const nights = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000) : 0
  const total = checkIn && checkOut && nights > 0 ? calcTotal(checkIn, checkOut, rules, guests) : 0
  const avg = nights > 0 ? Math.round(total / nights) : 0
  const canBook = !!checkIn && !!checkOut && nights >= 1 && form.name.trim().length > 0 && form.email.includes('@') && agreed

  function handleDateSelect(date: Date) {
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null) }
    else if (date > checkIn) { setCheckOut(date) }
    else { setCheckIn(date); setCheckOut(null) }
  }

  async function handlePay() {
    if (!canBook || !checkIn || !checkOut) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          guestName: form.name.trim(),
          guestEmail: form.email.toLowerCase().trim(),
          guests_count: guests,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error ?? 'Unexpected error'); return }
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success screen ───────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-md mx-auto px-6 pt-40 pb-24 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/12 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">{t('Резервацията е потвърдена!', 'Booking Confirmed!')}</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t('Плащането е прието. Изпратихме касова бележка на вашия имейл.', 'Payment accepted. We sent a receipt to your email.')}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="glass font-medium px-6 py-3 rounded-full hover:bg-secondary transition-all text-sm">{t('Начало', 'Home')}</Link>
            <Link href="/bansko" className="btn-gradient font-semibold px-6 py-3 rounded-full cta-glow text-sm flex items-center gap-2">{t('Разгледай Банско', 'Explore Bansko')} <ArrowRight size={13} /></Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // ─── Cancelled screen ─────────────────────────────────────
  if (cancelled) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-md mx-auto px-6 pt-40 pb-24 text-center">
          <h1 className="text-2xl font-bold mb-3">{t('Плащането е отказано', 'Payment Cancelled')}</h1>
          <p className="text-muted-foreground mb-8">{t('Не е извършено плащане. Датите остават свободни.', 'No payment was taken. The dates remain available.')}</p>
          <Link href="/availability" className="btn-gradient font-semibold px-6 py-4 rounded-full cta-glow flex items-center justify-center gap-2 max-w-xs mx-auto">
            {t('Избери нови дати', 'Choose New Dates')} <ArrowRight size={15} />
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // ─── Main flow ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground page-enter">
      <Navbar />

      <section className="pt-36 pb-12 px-6 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('Онлайн резервация', 'Online Reservation')}</h1>
        <p className="text-muted-foreground">{t('Избери дати, брой гости и плати онлайн сигурно.', 'Choose dates, number of guests and pay securely online.')}</p>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-28 grid md:grid-cols-5 gap-6">

        {/* ── Steps column ── */}
        <div className="md:col-span-3 space-y-4">

          {/* Step 1: Dates */}
          <div className={`glass rounded-2xl p-6 transition-all ${step === 1 ? 'ring-2 ring-primary/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step > 1 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                  {step > 1 ? <Check size={12} /> : '1'}
                </span>
                {t('Дати', 'Dates')}
              </h2>
              {step > 1 && (
                <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">{t('Промени', 'Change')}</button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <MiniCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleDateSelect} lang={lang} occupied={occupied} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className={`rounded-xl px-4 py-3 ${checkIn ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('Пристигане', 'Check-in')}</p>
                    <p className="font-semibold">{checkIn ? formatShort(checkIn, lang) : '—'}</p>
                  </div>
                  <div className={`rounded-xl px-4 py-3 ${checkOut ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('Напускане', 'Check-out')}</p>
                    <p className="font-semibold">{checkOut ? formatShort(checkOut, lang) : '—'}</p>
                  </div>
                </div>
                <button
                  disabled={!checkIn || !checkOut || nights < 1}
                  onClick={() => setStep(2)}
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-all ${checkIn && checkOut && nights >= 1 ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {t('Продължи', 'Continue')} <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {checkIn && checkOut ? `${formatShort(checkIn, lang)} — ${formatShort(checkOut, lang)} · ${nights} ${t('нощи', 'nights')}` : '—'}
              </div>
            )}
          </div>

          {/* Step 2: Guests + Contact */}
          {step >= 2 && (
            <div className={`glass rounded-2xl p-6 transition-all ${step === 2 ? 'ring-2 ring-primary/30' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step > 2 ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                    {step > 2 ? <Check size={12} /> : '2'}
                  </span>
                  {t('Гости и контакт', 'Guests & Contact')}
                </h2>
                {step > 2 && (
                  <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">{t('Промени', 'Change')}</button>
                )}
              </div>

              {step === 2 ? (
                <div className="space-y-4">
                  {/* Guests */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Users size={12} />{t('Брой гости', 'Guests')} (макс. 5)</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setGuests(g => Math.max(1, g-1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg hover:bg-secondary/70 transition-colors">−</button>
                      <span className="text-2xl font-bold w-10 text-center tabular-nums text-primary">{guests}</span>
                      <button onClick={() => setGuests(g => Math.min(5, g+1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg hover:bg-secondary/70 transition-colors">+</button>
                      {guests !== 2 && (
                        <span className="text-xs text-primary/70">
                          {guests < 2 ? '−20%' : `+${Math.round((GUEST_MULTIPLIERS[guests] - 1) * 100)}%`}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Name */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Имена', 'Full Name')} *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder={t('Вашите имена', 'Your full name')}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                  </div>
                  <button
                    disabled={!form.name.trim() || !form.email.includes('@')}
                    onClick={() => setStep(3)}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-all ${form.name.trim() && form.email.includes('@') ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                  >
                    {t('Към плащане', 'To Payment')} <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{form.name} · {form.email} · {guests} {t('гости', 'guests')}</p>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {step >= 3 && (
            <div className="glass rounded-2xl p-6 ring-2 ring-primary/30">
              <h2 className="font-semibold flex items-center gap-2 mb-5">
                <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold bg-primary/20 text-primary">3</span>
                {t('Плащане', 'Payment')}
              </h2>

              <div className="space-y-5">
                {/* Stripe info */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
                  <Lock size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">{t('100% Сигурно онлайн плащане', '100% Secure Online Payment')}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('Плащането се обработва чрез Stripe. Данните ви са криптирани — никога не съхраняваме данни на карта.',
                         'Payment processed through Stripe. Your data is encrypted — we never store card details.')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield size={12} className="text-primary" />
                      <span className="text-[11px] text-muted-foreground">SSL · PCI DSS · 3D Secure · Visa · Mastercard · Apple Pay</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAgreed(a => !a)}
                    className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${agreed ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}
                  >
                    {agreed && <Check size={11} className="text-primary-foreground" />}
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {t('Прочетох и приемам условията за резервация и политиката за анулиране.',
                       'I have read and accept the booking conditions and cancellation policy.')}
                  </span>
                </label>

                {submitError && (
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                    <Info size={15} className="shrink-0 mt-0.5" />
                    {submitError}
                  </div>
                )}

                <button
                  disabled={!canBook || submitting}
                  onClick={handlePay}
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-full text-base transition-all ${canBook && !submitting ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      {t('Обработва се...', 'Processing...')}
                    </span>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      {total > 0
                        ? t(`Плати €${total} — Запази апартамента`, `Pay €${total} — Reserve Apartment`)
                        : t('Плати онлайн', 'Pay Online')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="md:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">{t('Резюме на резервацията', 'Booking Summary')}</h3>
            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays size={13} />{t('Пристигане', 'Check-in')}</span>
                <span className="font-medium">{checkIn ? formatShort(checkIn, lang) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays size={13} />{t('Напускане', 'Check-out')}</span>
                <span className="font-medium">{checkOut ? formatShort(checkOut, lang) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('Нощи', 'Nights')}</span>
                <span className="font-medium">{nights || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('Гости', 'Guests')}</span>
                <span className="font-medium">{guests}</span>
              </div>
            </div>
            {total > 0 && (
              <>
                <div className="h-px bg-border/30 mb-4" />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>~€{avg} × {nights} {t('нощи', 'nights')}</span>
                    <span>€{total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-border/30 mt-2">
                    <span>{t('Общо', 'Total')}</span>
                    <span className="text-primary">€{total}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-sm">{t('Сезонни цени (€/нощ)', 'Seasonal Rates (€/night)')}</h3>
            <PricingTable lang={lang} rules={rules} />
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">{t('Условия', 'Conditions')}</h3>
            <ConditionsPanel lang={lang} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ─── Page wrapper (Suspense for useSearchParams) ──────────────
export default function ReservePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ReserveInner />
    </Suspense>
  )
}
