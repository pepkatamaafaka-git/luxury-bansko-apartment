'use client'

import { useState, useMemo, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { getNightlyRate, DEFAULT_PRICING_RULES } from '@/lib/pricing'
import type { PricingRule } from '@/lib/supabase'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Check, Snowflake, TreePine, Info, Calendar as CalIcon,
} from 'lucide-react'

// ─── Date utilities ───────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  // Monday-first: 0=Mon … 6=Sun
  const raw = new Date(year, month, 1).getDay()
  return (raw + 6) % 7
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}
function formatShort(d: Date, lang: 'bg' | 'en') {
  return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', {
    day: 'numeric', month: 'short',
  })
}

const BG_MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
// Monday-first headers
const BG_DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']
const EN_DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su']

// ─── Pricing helpers ─────────────────────────────────────────
type PricingLike = Pick<PricingRule, 'months' | 'weekday_price' | 'weekend_price'>

function calcTotalPrice(checkIn: Date, checkOut: Date, pricing: PricingLike[]): number {
  let total = 0
  const cur = new Date(checkIn)
  while (cur < checkOut) {
    total += getNightlyRate(cur, pricing)
    cur.setDate(cur.getDate() + 1)
  }
  return total
}

// ─── Calendar component ───────────────────────────────────────
// No hover state — all hover done via CSS only → zero lag
function Calendar({
  checkIn, checkOut, onSelectDate, lang, occupiedSet,
}: {
  checkIn: Date | null
  checkOut: Date | null
  onSelectDate: (d: Date) => void
  lang: 'bg' | 'en'
  occupiedSet: Set<string>
}) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d
  }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const MONTHS = lang === 'bg' ? BG_MONTHS : EN_MONTHS
  const DAYS   = lang === 'bg' ? BG_DAYS   : EN_DAYS

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow    = getFirstDayOfWeek(viewYear, viewMonth)
  const canGoPrev   = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  // Pre-compute statuses for all days — no state, no re-render on hover
  const dayStatuses = useMemo(() => {
    const statuses: Record<number, 'past' | 'occupied' | 'start' | 'end' | 'range' | 'available'> = {}
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day)
      if (d < today) { statuses[day] = 'past'; continue }
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      if (occupiedSet.has(key)) { statuses[day] = 'occupied'; continue }
      if (checkIn && isSameDay(d, checkIn)) { statuses[day] = 'start'; continue }
      if (checkOut && isSameDay(d, checkOut)) { statuses[day] = 'end'; continue }
      if (checkIn && checkOut && d > checkIn && d < checkOut) { statuses[day] = 'range'; continue }
      statuses[day] = 'available'
    }
    return statuses
  }, [viewYear, viewMonth, daysInMonth, today, occupiedSet, checkIn, checkOut])

  const handleClick = (day: number) => {
    const s = dayStatuses[day]
    if (s === 'past' || s === 'occupied') return
    const clicked = new Date(viewYear, viewMonth, day)
    onSelectDate(clicked)
  }

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => {
            if (!canGoPrev) return
            if (viewMonth === 0) { setViewYear(v => v - 1); setViewMonth(11) }
            else setViewMonth(m => m - 1)
          }}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-base">{MONTHS[viewMonth]} {viewYear}</span>
        <button
          onClick={() => {
            if (viewMonth === 11) { setViewYear(v => v + 1); setViewMonth(0) }
            else setViewMonth(m => m + 1)
          }}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground/60 py-1 tracking-wider uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid — no hover state, pure CSS hover */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const s = dayStatuses[day]
          const isStart    = s === 'start'
          const isEnd      = s === 'end'
          const inRange    = s === 'range'
          const isOccupied = s === 'occupied'
          const isPast     = s === 'past'
          const isAvail    = s === 'available'

          // Range background spans full cell width; dot/circle sits inside
          return (
            <div
              key={day}
              className={[
                'relative h-10 flex items-center justify-center',
                // full-width range background (no gap between cells)
                inRange  ? 'bg-primary/10' : '',
                // half-width range bg on start (right half) and end (left half)
                isStart  ? 'bg-gradient-to-l from-primary/10 from-50% to-transparent to-50%' : '',
                isEnd    ? 'bg-gradient-to-r from-primary/10 from-50% to-transparent to-50%' : '',
              ].join(' ')}
              onClick={() => handleClick(day)}
            >
              <div className={[
                'w-9 h-9 flex items-center justify-center text-sm font-medium select-none transition-colors',
                // start / end: full circle, primary colour
                isStart || isEnd
                  ? 'rounded-full bg-primary text-primary-foreground font-bold cursor-pointer'
                  : '',
                // in range: no rounding, subtle tint
                inRange
                  ? 'rounded-none text-foreground cursor-pointer'
                  : '',
                // available: CSS hover only (no state)
                isAvail
                  ? 'rounded-full cursor-pointer hover:bg-primary/15 hover:text-primary'
                  : '',
                // past
                isPast
                  ? 'rounded-full text-muted-foreground/25 cursor-default'
                  : '',
                // occupied: strikethrough style
                isOccupied
                  ? 'rounded-full text-muted-foreground/30 cursor-not-allowed line-through'
                  : '',
              ].join(' ')}
              >
                {day}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/20 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          {lang === 'bg' ? 'Избрана дата' : 'Selected'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary/15 inline-block" />
          {lang === 'bg' ? 'Период' : 'Range'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-muted-foreground/20 inline-block" />
          {lang === 'bg' ? 'Заето' : 'Occupied'}
        </span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function AvailabilityPage() {
  const { t, lang } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()

  // ── Fetch occupied dates + prices on page load ──
  const [occupied, setOccupied] = useState<Set<string>>(new Set())
  const [pricing, setPricing] = useState<PricingLike[]>(DEFAULT_PRICING_RULES)

  useEffect(() => {
    const now = new Date()
    const from = now.toISOString().split('T')[0]
    const to = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString().split('T')[0]
    Promise.all([
      fetch(`/api/availability?from=${from}&to=${to}`).then(r => r.ok ? r.json() : []),
      fetch('/api/prices').then(r => r.ok ? r.json() : []),
    ])
      .then(([ranges, priceRules]: [{ start_date: string; end_date: string }[], PricingLike[]]) => {
        if (Array.isArray(ranges)) {
          const set = new Set<string>()
          for (const range of ranges) {
            const cur = new Date(range.start_date)
            const end = new Date(range.end_date)
            while (cur < end) {
              set.add(cur.toISOString().split('T')[0])
              cur.setDate(cur.getDate() + 1)
            }
          }
          setOccupied(set)
        }
        if (Array.isArray(priceRules) && priceRules.length > 0) setPricing(priceRules)
      })
      .catch(() => {/* silent */})
  }, [])

  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)

  const handleDateSelect = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date); setCheckOut(null)
    } else if (date > checkIn) {
      setCheckOut(date)
    } else {
      setCheckIn(date); setCheckOut(null)
    }
  }

  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
    : 0
  const totalPrice = checkIn && checkOut && nights > 0
    ? calcTotalPrice(checkIn, checkOut, pricing)
    : 0
  const avgNightly = nights > 0 ? Math.round(totalPrice / nights) : 0
  const canBook = !!checkIn && !!checkOut && nights >= 1

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">
      <Navbar />

      {/* Page header */}
      <section className="pt-36 pb-12 px-6 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 glass text-xs tracking-widest uppercase px-4 py-2 rounded-full text-foreground/60 mb-5">
          {season === 'winter'
            ? <><Snowflake size={12} className="text-primary" /> {t('Зимен сезон', 'Winter Season')}</>
            : <><TreePine size={12} className="text-primary" /> {t('Летен сезон', 'Summer Season')}</>
          }
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
          {t('Провери свободни дати', 'Check Availability')}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
          {t(
            'Избери своите дати и резервирай онлайн — бързо, сигурно, без посредници.',
            'Choose your dates and book online — fast, secure, no middlemen.',
          )}
        </p>
        <p className="mt-2 text-sm text-muted-foreground/50 flex items-center justify-center gap-1.5">
          <CalIcon size={12} />
          {t(
            'Заетите дати се синхронизират с Booking.com.',
            'Occupied dates are synced from Booking.com.',
          )}
        </p>
      </section>

      <div ref={revealRef} className="max-w-2xl mx-auto px-6 pb-28">
        <div className="glass rounded-2xl p-6 md:p-8 reveal">
          <h2 className="text-xl font-semibold mb-6">
            {t('Избери дати', 'Choose Dates')}
          </h2>

          <Calendar
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDate={handleDateSelect}
            lang={lang}
            occupiedSet={occupied}
          />

          {/* Date + price summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-secondary/50 px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Пристигане', 'Check-in')}</p>
              <p className="font-semibold text-sm">{checkIn ? formatShort(checkIn, lang) : '—'}</p>
            </div>
            <div className="rounded-xl bg-secondary/50 px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Напускане', 'Check-out')}</p>
              <p className="font-semibold text-sm">{checkOut ? formatShort(checkOut, lang) : '—'}</p>
            </div>
            <div className={`rounded-xl px-4 py-3 transition-colors ${nights > 0 ? 'bg-primary/10' : 'bg-secondary/50'}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Нощи', 'Nights')}</p>
              <p className={`font-bold text-sm ${nights > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{nights > 0 ? nights : '—'}</p>
            </div>
            <div className={`rounded-xl px-4 py-3 transition-colors ${totalPrice > 0 ? 'bg-primary/10' : 'bg-secondary/50'}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Ориент. цена', 'Est. Price')}</p>
              <p className={`font-bold text-sm ${totalPrice > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {totalPrice > 0 ? `€${totalPrice}` : '—'}
              </p>
              {avgNightly > 0 && (
                <p className="text-[10px] text-muted-foreground">~€{avgNightly}/{t('нощ', 'night')}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={canBook
                ? `/reserve?in=${checkIn!.toISOString().split('T')[0]}&out=${checkOut!.toISOString().split('T')[0]}&guests=2`
                : '#'}
              aria-disabled={!canBook}
              onClick={e => { if (!canBook) e.preventDefault() }}
              className={`w-full flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-full transition-all ${
                canBook
                  ? 'btn-gradient cta-glow'
                  : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
              }`}
            >
              {t('Резервирай онлайн', 'Reserve Online')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}