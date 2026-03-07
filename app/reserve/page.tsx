'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight, Check, Shield, Lock,
  CreditCard, Star, Info, Users, CalendarDays, ArrowLeft,
} from 'lucide-react'

// ─── Shared date utilities (same as availability page) ────────
function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfWeek(year: number, month: number) { const r = new Date(year, month, 1).getDay(); return (r + 6) % 7 }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function formatDate(d: Date, lang: 'bg' | 'en') { return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }
function formatShort(d: Date, lang: 'bg' | 'en') { return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'short' }) }
const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const BG_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']
const EN_DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ─── Occupied ranges (hardcoded — same data as availability) ──
const OCCUPIED_RANGES = [
  { start: '2026-01-15', end: '2026-01-22' },
  { start: '2026-02-07', end: '2026-02-14' },
  { start: '2026-03-01', end: '2026-03-08' },
  { start: '2026-07-10', end: '2026-07-18' },
  { start: '2026-08-01', end: '2026-08-10' },
]

// ─── Pricing tiers ────────────────────────────────────────────
const PRICING = [
  { months: [11, 0, 1], weekday: 95,  weekend: 120, label: { bg: 'Висок ски сезон', en: 'Peak Ski Season' } },
  { months: [2, 3],     weekday: 75,  weekend: 95,  label: { bg: 'Среден сезон',     en: 'Mid Season' } },
  { months: [4, 5, 9, 10], weekday: 55, weekend: 65, label: { bg: 'Извън сезон',     en: 'Off Season' } },
  { months: [6, 7, 8],  weekday: 80,  weekend: 100, label: { bg: 'Летен сезон',      en: 'Summer Season' } },
]

function getNightlyRate(date: Date) {
  const m = date.getMonth(); const dow = date.getDay()
  const isWknd = dow === 5 || dow === 6 || dow === 0
  const tier = PRICING.find(p => p.months.includes(m)) ?? PRICING[2]
  return isWknd ? tier.weekend : tier.weekday
}

function calcTotal(checkIn: Date, checkOut: Date) {
  let total = 0; const cur = new Date(checkIn)
  while (cur < checkOut) { total += getNightlyRate(cur); cur.setDate(cur.getDate() + 1) }
  return total
}

function buildOccupiedSet() {
  const set = new Set<string>()
  for (const r of OCCUPIED_RANGES) {
    const cur = new Date(r.start)
    const end = new Date(r.end)
    while (cur <= end) { set.add(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1) }
  }
  return set
}

// ─── Mini calendar for reserve page ──────────────────────────
function MiniCalendar({ checkIn, checkOut, onSelect, lang }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void; lang: 'bg' | 'en'
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const occupied = useMemo(() => buildOccupiedSet(), [])
  const MONTHS = lang === 'bg' ? BG_MONTHS : EN_MONTHS
  const DAYS = lang === 'bg' ? BG_DAYS : EN_DAYS
  const days = getDaysInMonth(viewYear, viewMonth)
  const first = getFirstDayOfWeek(viewYear, viewMonth)
  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  function status(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    if (d < today) return 'past'
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    if (occupied.has(k)) return 'occupied'
    if (checkIn && isSameDay(d, checkIn)) return 'start'
    if (checkOut && isSameDay(d, checkOut)) return 'end'
    if (checkIn && checkOut && d > checkIn && d < checkOut) return 'range'
    return 'available'
  }

  // Show price on hover
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const hoverRate = hoverDay ? getNightlyRate(new Date(viewYear, viewMonth, hoverDay)) : null

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (!canPrev) return; if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v-1) } else setViewMonth(m => m-1) }}
          disabled={!canPrev} className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-30">
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-sm">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v+1) } else setViewMonth(m => m+1) }}
          className="p-2 rounded-full hover:bg-secondary transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/60 py-1 uppercase">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: first }).map((_,i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_,i) => {
          const day = i+1; const s = status(day)
          const rate = getNightlyRate(new Date(viewYear, viewMonth, day))
          return (
            <button key={day}
              disabled={s === 'past' || s === 'occupied'}
              onClick={() => { if (s !== 'past' && s !== 'occupied') { const d = new Date(viewYear,viewMonth,day); onSelect(d) } }}
              onMouseEnter={() => setHoverDay(day)}
              onMouseLeave={() => setHoverDay(null)}
              title={s !== 'past' && s !== 'occupied' ? `€${rate}` : undefined}
              className={[
                'relative flex flex-col items-center justify-center h-10 w-full text-xs transition-all duration-100 focus:outline-none rounded-lg',
                s === 'past' ? 'text-muted-foreground/25 cursor-not-allowed' : '',
                s === 'occupied' ? 'cursor-not-allowed' : '',
                s === 'start' || s === 'end' ? 'bg-primary text-primary-foreground font-bold z-10' : '',
                s === 'range' ? 'bg-primary/12 text-foreground rounded-none' : '',
                s === 'start' ? 'rounded-r-none' : '',
                s === 'end' ? 'rounded-l-none' : '',
                s === 'available' ? 'hover:bg-primary/10' : '',
              ].join(' ')}
            >
              {s === 'occupied' ? (
                <span className="relative w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <span className="absolute w-5 h-px bg-muted-foreground/25 rotate-45" />
                  <span className="absolute w-5 h-px bg-muted-foreground/25 -rotate-45" />
                  <span className="relative text-[10px]">{day}</span>
                </span>
              ) : (
                <>
                  <span>{day}</span>
                  {s === 'available' && hoverDay === day && (
                    <span className="text-[8px] text-primary leading-none font-semibold">€{rate}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
      {/* Hover rate indicator */}
      <div className="mt-3 h-5 text-center text-[11px] text-muted-foreground">
        {hoverRate && hoverDay && status(hoverDay) === 'available' && (
          <span>€{hoverRate} / {lang === 'bg' ? 'нощ' : 'night'}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" />{lang === 'bg' ? 'Избрано' : 'Selected'}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/12" />{lang === 'bg' ? 'Период' : 'Range'}</span>
        <span className="flex items-center gap-1 relative w-4 h-3"><span className="absolute w-3 h-px bg-muted-foreground/40 rotate-45 top-1.5 left-0.5" /><span className="absolute w-3 h-px bg-muted-foreground/40 -rotate-45 top-1.5 left-0.5" /></span>
        <span className="ml-0.5">{lang === 'bg' ? 'Заето' : 'Occupied'}</span>
      </div>
    </div>
  )
}

// ─── Pricing reference table ──────────────────────────────────
function PricingTable({ lang }: { lang: 'bg' | 'en' }) {
  return (
    <div className="space-y-2">
      {PRICING.map((tier, i) => (
        <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-border/30 last:border-0">
          <span className="text-muted-foreground">{tier.label[lang]}</span>
          <div className="flex gap-3 font-medium">
            <span>€{tier.weekday}/{lang === 'bg' ? 'нощ' : 'night'}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>€{tier.weekend} <span className="text-muted-foreground font-normal">{lang === 'bg' ? '(уик)' : '(wknd)'}</span></span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Conditions panel ─────────────────────────────────────────
function ConditionsPanel({ lang }: { lang: 'bg' | 'en' }) {
  const bg = lang === 'bg'
  return (
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <div>
        <h4 className="font-semibold text-foreground mb-1">{bg ? 'Какво включва нощувката' : 'What is included'}</h4>
        <ul className="space-y-1">
          {(bg ? [
            'Нощувка в двустаен апартамент (до 6 гости)',
            'Пълен достъп до СПА зона — вътрешен басейн, сауна, хамам, джакузи',
            'Безплатен фитнес',
            'Безплатен Wi-Fi',
            'Паркинг (при наличност)',
            'Крайно почистване',
          ] : [
            'Night in a 2-bedroom apartment (up to 6 guests)',
            'Full SPA access — indoor pool, sauna, hammam, jacuzzi',
            'Free gym access',
            'Free Wi-Fi',
            'Parking (subject to availability)',
            'Final cleaning',
          ]).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check size={13} className="text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{bg ? 'Условия за резервация' : 'Booking Conditions'}</h4>
        <ul className="space-y-1 text-xs">
          {(bg ? [
            'Минимален престой: 2 нощувки',
            'Пристигане: от 15:00 ч. | Напускане: до 11:00 ч.',
            'Домашни любимци: не се допускат',
            'Пушене: само на тераса',
            'Безплатно анулиране: до 7 дни преди пристигане',
            'Анулиране под 7 дни: задържа се 1 нощувка',
          ] : [
            'Minimum stay: 2 nights',
            'Check-in: from 15:00 | Check-out: by 11:00',
            'Pets: not permitted',
            'Smoking: terrace only',
            'Free cancellation: up to 7 days before arrival',
            'Cancellation under 7 days: 1 night retained',
          ]).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Inner component (uses useSearchParams) ───────────────────
function ReserveInner() {
  const { t, lang } = useLang()
  const { season } = useSeason()
  const params = useSearchParams()

  const parseDate = (s: string | null) => {
    if (!s) return null
    const d = new Date(s); d.setHours(0,0,0,0)
    return isNaN(d.getTime()) ? null : d
  }

  const [checkIn, setCheckIn]   = useState<Date | null>(parseDate(params.get('in')))
  const [checkOut, setCheckOut] = useState<Date | null>(parseDate(params.get('out')))
  const [guests, setGuests]     = useState(parseInt(params.get('guests') ?? '2') || 2)
  const [step, setStep]         = useState<1|2|3>(checkIn && checkOut ? 2 : 1)

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [agreed, setAgreed]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleDateSelect = (d: Date) => {
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(d); setCheckOut(null) }
    else if (d > checkIn) setCheckOut(d)
    else { setCheckIn(d); setCheckOut(null) }
  }

  const nights = checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000) : 0
  const total  = checkIn && checkOut && nights > 0 ? calcTotal(checkIn, checkOut) : 0
  const avg    = nights > 0 ? Math.round(total / nights) : 0
  const canBook = checkIn && checkOut && nights >= 2 && form.name && form.email && agreed

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-12 px-6 max-w-4xl mx-auto">
        <Link href="/availability" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={14} /> {t('Назад към наличност', 'Back to Availability')}
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">{t('Резервирай апартамента', 'Reserve the Apartment')}</h1>
        <p className="text-muted-foreground leading-relaxed max-w-lg">
          {t('Избери дати, провери цената и изпрати резервацията. Плащането е 100% онлайн и защитено чрез Stripe.',
             'Choose dates, check the price and send your reservation. Payment is 100% online and secured through Stripe.')}
        </p>
        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 mt-5">
          {[
            { icon: Lock, text: t('100% Защитено плащане', '100% Secure Payment') },
            { icon: Shield, text: t('Stripe Checkout', 'Stripe Checkout') },
            { icon: Star, text: t('9.7/10 Booking.com', '9.7/10 Booking.com') },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground glass px-3 py-2 rounded-full">
              <Icon size={12} className="text-primary" /> {text}
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-28 grid md:grid-cols-5 gap-8">

        {/* ─── Left: Main flow ────────────────── */}
        <div className="md:col-span-3 space-y-6">

          {/* Step 1: Calendar */}
          <div className={`glass rounded-2xl p-6 transition-all ${step === 1 ? 'ring-2 ring-primary/30' : ''}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>1</span>
                {t('Избери дати', 'Choose Dates')}
              </h2>
              {step > 1 && checkIn && checkOut && (
                <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">{t('Промени', 'Change')}</button>
              )}
            </div>
            {step === 1 ? (
              <>
                <MiniCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleDateSelect} lang={lang} />
                <button
                  disabled={!checkIn || !checkOut || nights < 2}
                  onClick={() => setStep(2)}
                  className={`mt-5 w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-all ${checkIn && checkOut && nights >= 2 ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {t('Продължи към детайли', 'Continue to Details')} <ArrowRight size={15} />
                </button>
                {nights > 0 && nights < 2 && (
                  <p className="text-xs text-destructive text-center mt-2">{t('Минимален престой: 2 нощи', 'Minimum stay: 2 nights')}</p>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {checkIn && checkOut ? `${formatShort(checkIn, lang)} → ${formatShort(checkOut, lang)} · ${nights} ${t('нощи', 'nights')}` : t('Не са избрани дати', 'No dates selected')}
              </div>
            )}
          </div>

          {/* Step 2: Guest details */}
          {step >= 2 && (
            <div className={`glass rounded-2xl p-6 transition-all ${step === 2 ? 'ring-2 ring-primary/30' : ''}`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>2</span>
                  {t('Данни за гостите', 'Guest Details')}
                </h2>
              </div>
              {step === 2 ? (
                <div className="space-y-4">
                  {/* Guests */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Users size={12} />{t('Брой гости', 'Number of Guests')}</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setGuests(g => Math.max(1, g-1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg hover:bg-secondary/70 transition-colors">−</button>
                      <span className="text-2xl font-bold w-10 text-center tabular-nums text-primary">{guests}</span>
                      <button onClick={() => setGuests(g => Math.min(6, g+1))} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg hover:bg-secondary/70 transition-colors">+</button>
                      <span className="text-xs text-muted-foreground">{t('макс. 6', 'max. 6')}</span>
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
                  {/* Phone */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Телефон / WhatsApp', 'Phone / WhatsApp')}</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+359 888 ..."
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                  </div>
                  <button
                    disabled={!form.name || !form.email}
                    onClick={() => setStep(3)}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-full transition-all ${form.name && form.email ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                  >
                    {t('Към плащане', 'To Payment')} <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{form.name} · {form.email}</span>
                  <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">{t('Промени', 'Change')}</button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {step >= 3 && (
            <div className="glass rounded-2xl p-6 ring-2 ring-primary/30">
              <h2 className="font-semibold flex items-center gap-2 mb-5">
                <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold bg-primary text-primary-foreground">3</span>
                {t('Плащане', 'Payment')}
              </h2>

              {!submitted ? (
                <div className="space-y-5">
                  {/* Stripe info banner */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
                    <Lock size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">{t('100% Сигурно онлайн плащане', '100% Secure Online Payment')}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('Плащането се обработва чрез Stripe — световен лидер в сигурното онлайн плащане. Данните ви са криптирани и защитени. Никога не съхраняваме данни на карта.',
                           'Payment is processed through Stripe — the world leader in secure online payments. Your data is encrypted and protected. We never store card details.')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield size={12} className="text-primary" />
                        <span className="text-[11px] text-muted-foreground">SSL · PCI DSS · 3D Secure</span>
                      </div>
                    </div>
                  </div>

                  {/* Card placeholder (Stripe will replace this) */}
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><CreditCard size={12} />{t('Данни на карта (Stripe Checkout)', 'Card Details (Stripe Checkout)')}</label>
                    <div className="w-full bg-input border border-border rounded-xl px-4 py-4 flex items-center gap-3 text-sm text-muted-foreground/60 cursor-not-allowed select-none">
                      <CreditCard size={16} className="text-muted-foreground/40" />
                      {t('Stripe Checkout ще се интегрира тук', 'Stripe Checkout will be integrated here')}
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 mt-1.5 flex items-center gap-1"><Info size={10} /> {t('Приемаме Visa, Mastercard, Apple Pay, Google Pay', 'We accept Visa, Mastercard, Apple Pay, Google Pay')}</p>
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
                      {t('Прочетох и приемам ', 'I have read and accept the ')}
                      <button onClick={() => {}} className="text-primary hover:underline font-medium">
                        {t('условията за резервация', 'booking conditions')}
                      </button>
                      {t(' и политиката за анулиране.', ' and cancellation policy.')}
                    </span>
                  </label>

                  <button
                    disabled={!canBook}
                    onClick={() => setSubmitted(true)}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-full text-base transition-all ${canBook ? 'btn-gradient cta-glow' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                  >
                    <Lock size={16} />
                    {t(`Плати €${total} — Запази апартамента`, `Pay €${total} — Reserve Apartment`)}
                  </button>
                </div>
              ) : (
                /* Success state */
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/12 flex items-center justify-center mx-auto mb-5">
                    <Check size={28} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{t('Резервацията е получена!', 'Reservation Received!')}</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed text-sm">
                    {t(`Изпратихме потвърждение на ${form.email}. Ще се свържем с вас в рамките на 24 часа.`,
                       `We've sent a confirmation to ${form.email}. We'll contact you within 24 hours.`)}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/" className="glass font-medium px-6 py-3 rounded-full hover:bg-secondary transition-all text-sm">{t('Начало', 'Home')}</Link>
                    <Link href="/bansko" className="btn-gradient font-semibold px-6 py-3 rounded-full cta-glow text-sm flex items-center gap-2">{t('Разгледай Банско', 'Explore Bansko')} <ArrowRight size={13} /></Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Right: Summary sidebar ─────────── */}
        <div className="md:col-span-2 space-y-5">
          {/* Booking summary */}
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
                <div className="gradient-divider mb-4" />
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
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                  {t('Цените са ориентировъчни и може да варират. Окончателната цена се потвърждава при резервация.',
                     'Prices are indicative and may vary. Final price confirmed at booking.')}
                </p>
              </>
            )}
          </div>

          {/* Pricing table */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-sm">{t('Сезонни цени (€/нощ)', 'Seasonal Rates (€/night)')}</h3>
            <PricingTable lang={lang} />
            <p className="text-[11px] text-muted-foreground mt-3 flex items-start gap-1.5">
              <Info size={10} className="mt-0.5 shrink-0" />
              {t('Задръжте мишката върху дата в календара за точна цена.', 'Hover over a date in the calendar for the exact rate.')}
            </p>
          </div>

          {/* Conditions */}
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
