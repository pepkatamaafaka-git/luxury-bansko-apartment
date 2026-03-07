'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import Link from 'next/link'
import {
  ArrowRight, ChevronLeft, ChevronRight, MessageCircle,
  Mail, Check, Users, Snowflake, TreePine, Info, Calendar as CalIcon,
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
function formatDate(d: Date, lang: 'bg' | 'en') {
  return d.toLocaleDateString(lang === 'bg' ? 'bg-BG' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
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

// ─── iCal-ready occupied ranges ──────────────────────────────
// These will eventually be populated from Booking.com / Airbnb iCal feeds.
const OCCUPIED_RANGES: { start: string; end: string; source: 'booking' | 'airbnb' | 'manual' }[] = [
  { start: '2026-01-15', end: '2026-01-22', source: 'booking' },
  { start: '2026-02-07', end: '2026-02-14', source: 'airbnb' },
  { start: '2026-03-01', end: '2026-03-08', source: 'booking' },
  { start: '2026-07-10', end: '2026-07-18', source: 'airbnb' },
  { start: '2026-08-01', end: '2026-08-10', source: 'booking' },
]

// ─── Dynamic nightly pricing ──────────────────────────────────
// Prices in EUR. Adjust for real rates when connecting backend.
const PRICING: { months: number[]; weekday: number; weekend: number; label: { bg: string; en: string } }[] = [
  { months: [11, 0, 1], weekday: 95,  weekend: 120, label: { bg: 'Висок ски сезон (Дек–Фев)',   en: 'Peak Ski Season (Dec–Feb)' } },
  { months: [2, 3],     weekday: 75,  weekend: 95,  label: { bg: 'Среден сезон (Мар–Апр)',        en: 'Mid Season (Mar–Apr)' } },
  { months: [4, 5, 9, 10], weekday: 55, weekend: 65, label: { bg: 'Извън сезон (Май–Юни, Окт)',  en: 'Off Season (May–Jun, Oct)' } },
  { months: [6, 7, 8],  weekday: 80,  weekend: 100, label: { bg: 'Летен сезон (Юли–Сеп)',        en: 'Summer Season (Jul–Sep)' } },
]

function getNightlyRate(date: Date): number {
  const month = date.getMonth()
  const dow = date.getDay() // 0=Sun, 6=Sat
  const isWeekend = dow === 5 || dow === 6 || dow === 0
  const tier = PRICING.find(p => p.months.includes(month)) ?? PRICING[2]
  return isWeekend ? tier.weekend : tier.weekday
}

function calcTotalPrice(checkIn: Date, checkOut: Date): number {
  let total = 0
  const cur = new Date(checkIn)
  while (cur < checkOut) {
    total += getNightlyRate(cur)
    cur.setDate(cur.getDate() + 1)
  }
  return total
}

function buildOccupiedSet(ranges: typeof OCCUPIED_RANGES): Set<string> {
  const set = new Set<string>()
  for (const r of ranges) {
    const start = new Date(r.start)
    const end = new Date(r.end)
    const cur = new Date(start)
    while (cur <= end) {
      set.add(cur.toISOString().split('T')[0])
      cur.setDate(cur.getDate() + 1)
    }
  }
  return set
}

// ─── Calendar component ───────────────────────────────────────
function Calendar({
  checkIn, checkOut, onSelectDate, lang,
}: {
  checkIn: Date | null
  checkOut: Date | null
  onSelectDate: (d: Date) => void
  lang: 'bg' | 'en'
}) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d
  }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const occupiedSet = useMemo(() => buildOccupiedSet(OCCUPIED_RANGES), [])

  const MONTHS = lang === 'bg' ? BG_MONTHS : EN_MONTHS
  const DAYS   = lang === 'bg' ? BG_DAYS   : EN_DAYS

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow    = getFirstDayOfWeek(viewYear, viewMonth)

  const canGoPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()

  const goToPrev = () => {
    if (!canGoPrev) return
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1) }
    else setViewMonth(m => m - 1)
  }
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1) }
    else setViewMonth(m => m + 1)
  }

  function dayStatus(day: number): 'past' | 'occupied' | 'start' | 'end' | 'range' | 'available' {
    const d = new Date(viewYear, viewMonth, day)
    if (d < today) return 'past'
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    if (occupiedSet.has(key)) return 'occupied'
    if (checkIn && isSameDay(d, checkIn)) return 'start'
    if (checkOut && isSameDay(d, checkOut)) return 'end'
    if (checkIn && checkOut && d > checkIn && d < checkOut) return 'range'
    return 'available'
  }

  // Check if any day in a range is occupied
  function rangeHasOccupied(from: Date, to: Date): boolean {
    const cur = new Date(from); cur.setDate(cur.getDate() + 1)
    while (cur < to) {
      const key = cur.toISOString().split('T')[0]
      if (occupiedSet.has(key)) return true
      cur.setDate(cur.getDate() + 1)
    }
    return false
  }

  const handleClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day)
    const status = dayStatus(day)
    if (status === 'past' || status === 'occupied') return
    if (!checkIn || (checkIn && checkOut)) {
      onSelectDate(clicked)
    } else if (clicked <= checkIn) {
      onSelectDate(clicked)
    } else {
      if (rangeHasOccupied(checkIn, clicked)) {
        // Can't select across occupied dates — restart
        onSelectDate(clicked)
      } else {
        onSelectDate(clicked)
      }
    }
  }

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="p-2 rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={lang === 'bg' ? 'Предишен' : 'Previous'}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-semibold text-base">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goToNext}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label={lang === 'bg' ? 'Следващ' : 'Next'}
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

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const status = dayStatus(day)
          const isStart = status === 'start'
          const isEnd   = status === 'end'
          const inRange = status === 'range'
          const isOccupied = status === 'occupied'
          const isPast = status === 'past'

          return (
            <button
              key={day}
              disabled={isPast || isOccupied}
              onClick={() => handleClick(day)}
              className={[
                'relative h-9 w-full text-sm transition-all duration-150 focus:outline-none',
                isPast
                  ? 'text-muted-foreground/25 cursor-not-allowed'
                  : isOccupied
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:bg-primary/10 rounded-lg',
                isStart || isEnd
                  ? 'bg-primary text-primary-foreground font-bold rounded-lg z-10'
                  : '',
                inRange
                  ? 'bg-primary/12 text-foreground rounded-none'
                  : '',
                isStart ? 'rounded-r-none' : '',
                isEnd   ? 'rounded-l-none' : '',
              ].join(' ')}
            >
              {isOccupied ? (
                <span className="relative inline-flex items-center justify-center w-full h-full text-muted-foreground/40">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-6 h-px bg-muted-foreground/30 rotate-45 absolute" />
                    <span className="w-6 h-px bg-muted-foreground/30 -rotate-45 absolute" />
                  </span>
                  <span className="relative z-10 text-[11px] text-muted-foreground/30">{day}</span>
                </span>
              ) : day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" />
          {lang === 'bg' ? 'Избрана дата' : 'Selected'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary/12 inline-block" />
          {lang === 'bg' ? 'Избран период' : 'Selected range'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-3 h-3 inline-block">
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-3 h-px bg-muted-foreground/50 rotate-45 absolute" />
              <span className="w-3 h-px bg-muted-foreground/50 -rotate-45 absolute" />
            </span>
          </span>
          {lang === 'bg' ? 'Заето' : 'Occupied'}
        </span>
      </div>
    </div>
  )
}

// ─── iCal notice panel ────────────────────────────────────────
function ICalNotice({ lang }: { lang: 'bg' | 'en' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-xs font-medium text-primary hover:bg-primary/8 transition-colors"
      >
        <Info size={14} />
        {lang === 'bg'
          ? 'Свързване с Booking.com / Airbnb (ако сте домакин)'
          : 'Connect Booking.com / Airbnb (for the host)'}
        <ChevronRight size={12} className={`ml-auto transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>
            {lang === 'bg'
              ? 'За да се синхронизират заетите дати автоматично от Booking.com и Airbnb, трябва да:'
              : 'To sync occupied dates automatically from Booking.com and Airbnb:'}
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              {lang === 'bg'
                ? 'Получете iCal URL от Booking.com → Управление → Синхронизация на календар'
                : 'Get your iCal URL from Booking.com → Manage → Calendar sync'}
            </li>
            <li>
              {lang === 'bg'
                ? 'Получете iCal URL от Airbnb → Настройки → Наличност → Свържи/Импортирай календар'
                : 'Get your iCal URL from Airbnb → Settings → Availability → Connect/Import calendar'}
            </li>
            <li>
              {lang === 'bg'
                ? 'Добавете двата URL-а в /api/calendar/route.ts (сървърна функция) — тя парсва .ics файловете и попълва масива OCCUPIED_RANGES'
                : 'Add both URLs to /api/calendar/route.ts (server function) — it parses the .ics files and populates the OCCUPIED_RANGES array'}
            </li>
          </ol>
          <p className="text-primary/70 font-medium">
            {lang === 'bg'
              ? 'Структурата на календара е готова — достатъчно е да се добави API слой.'
              : 'The calendar structure is ready — only an API layer needs to be added.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────
function StepIndicator({ step }: { step: 1|2|3|4 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {([1,2,3,4] as const).map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={[
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
            s < step  ? 'bg-primary text-primary-foreground scale-95 opacity-70' :
            s === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                        'bg-secondary text-muted-foreground',
          ].join(' ')}>
            {s < step ? <Check size={14} /> : s}
          </div>
          {s < 4 && (
            <div className={`w-8 h-0.5 transition-all duration-500 ${s < step ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function AvailabilityPage() {
  const { t, lang } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()

  const [step, setStep] = useState<1|2|3|4>(1)
  const [booking, setBooking] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 2,
    name: '', email: '', phone: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleDateSelect = (date: Date) => {
    if (!booking.checkIn || (booking.checkIn && booking.checkOut)) {
      setBooking(b => ({ ...b, checkIn: date, checkOut: null }))
    } else if (date > booking.checkIn) {
      setBooking(b => ({ ...b, checkOut: date }))
    } else {
      setBooking(b => ({ ...b, checkIn: date, checkOut: null }))
    }
  }

  const nights = booking.checkIn && booking.checkOut
    ? Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86400000)
    : 0

  const totalPrice = booking.checkIn && booking.checkOut && nights > 0
    ? calcTotalPrice(booking.checkIn, booking.checkOut)
    : 0
  const avgNightly = nights > 0 ? Math.round(totalPrice / nights) : 0

  const canProceed = booking.checkIn && booking.checkOut && nights >= 1

  const seasonHighlights = season === 'winter'
    ? [
        t('Ски писти до 10 мин. от гондолата', 'Ski slopes, 10 min to gondola'),
        t('Топъл вътрешен басейн 36°C след ски деня', 'Warm indoor pool 36°C after skiing'),
        t('Финландска сауна с планинска гледка', 'Finnish sauna with mountain view'),
        t('Апре-ски бар Happy End', 'Apres-ski bar Happy End'),
      ]
    : [
        t('Пирин еко пътеки — ЮНЕСКО резерват', 'Pirin eco trails — UNESCO reserve'),
        t('СПА следобед след планинския преход', 'SPA afternoon after mountain hike'),
        t('Джаз фестивал Банско (август)', 'Bansko Jazz Festival (August)'),
        t('Е-байк наем в центъра', 'E-bike rental in the centre'),
      ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setStep(4)
  }

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
            'Избери своите дати, изпрати запитване — отговаряме бързо с потвърждение и цена.',
            'Choose your dates, send an enquiry — we respond quickly with confirmation and pricing.'
          )}
        </p>
        <p className="mt-2 text-sm text-muted-foreground/50 flex items-center justify-center gap-1.5">
          <CalIcon size={12} />
          {t(
            'Заетите дати се синхронизират с Booking.com и Airbnb.',
            'Occupied dates are synced from Booking.com and Airbnb.'
          )}
        </p>
      </section>

      <div ref={revealRef} className="max-w-2xl mx-auto px-6 pb-28">
        <StepIndicator step={step} />

        {/* ── Step 1: Dates ── */}
        {step === 1 && (
          <div className="glass rounded-2xl p-6 md:p-8 reveal">
            <h2 className="text-xl font-semibold mb-6">
              {t('1. Избери дати', '1. Choose Dates')}
            </h2>

            <Calendar
              checkIn={booking.checkIn}
              checkOut={booking.checkOut}
              onSelectDate={handleDateSelect}
              lang={lang}
            />

            <ICalNotice lang={lang} />

            {/* Date + price summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-secondary/50 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Пристигане', 'Check-in')}</p>
                <p className="font-semibold text-sm">{booking.checkIn ? formatShort(booking.checkIn, lang) : '—'}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t('Напускане', 'Check-out')}</p>
                <p className="font-semibold text-sm">{booking.checkOut ? formatShort(booking.checkOut, lang) : '—'}</p>
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

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                disabled={!canProceed}
                onClick={() => setStep(2)}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-full transition-all ${
                  canProceed ? 'glass text-foreground hover:bg-secondary border border-border/50' : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {t('Запитване', 'Enquire')} <ArrowRight size={16} />
              </button>
              {canProceed && (
                <Link
                  href={`/reserve?in=${booking.checkIn?.toISOString().split('T')[0]}&out=${booking.checkOut?.toISOString().split('T')[0]}&guests=${booking.guests}`}
                  className="flex-1 flex items-center justify-center gap-2 btn-gradient font-semibold px-6 py-4 rounded-full cta-glow"
                >
                  {t('Резервирай онлайн', 'Reserve Online')} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Guests + highlights ── */}
        {step === 2 && (
          <div className="glass rounded-2xl p-6 md:p-8 reveal">
            <h2 className="text-xl font-semibold mb-6">
              {t('2. Гости & Сезонни акценти', '2. Guests & Highlights')}
            </h2>

            {/* Date summary */}
            <div className="mb-7 p-4 bg-primary/8 rounded-xl border border-primary/15 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  <span className="text-muted-foreground">{t('Пристигане: ', 'Check-in: ')}</span>
                  <span className="font-medium">{booking.checkIn ? formatDate(booking.checkIn, lang) : '—'}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">{t('Напускане: ', 'Check-out: ')}</span>
                  <span className="font-medium">{booking.checkOut ? formatDate(booking.checkOut, lang) : '—'}</span>
                </span>
                <span className="font-bold text-primary">{nights} {t('нощи', 'nights')}</span>
                {totalPrice > 0 && (
                  <span className="font-bold text-primary">€{totalPrice} {t('общо', 'total')}</span>
                )}
              </div>
            </div>

            {/* Guest counter */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Users size={16} />
                {t('Брой гости (макс. 6)', 'Number of guests (max. 6)')}
              </label>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setBooking(b => ({ ...b, guests: Math.max(1, b.guests - 1) }))}
                  className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-secondary/70 transition-colors"
                >−</button>
                <span className="text-4xl font-bold w-14 text-center tabular-nums text-primary">
                  {booking.guests}
                </span>
                <button
                  onClick={() => setBooking(b => ({ ...b, guests: Math.min(6, b.guests + 1) }))}
                  className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl font-bold hover:bg-secondary/70 transition-colors"
                >+</button>
              </div>
            </div>

            {/* Seasonal highlights */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
                {season === 'winter'
                  ? <><Snowflake size={14} className="text-primary" /> {t('Какво ви очаква тази зима', 'What awaits you this winter')}</>
                  : <><TreePine size={14} className="text-primary" /> {t('Какво ви очаква това лято', 'What awaits you this summer')}</>
                }
              </h3>
              <ul className="space-y-2.5">
                {seasonHighlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check size={13} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/bansko"
              className="flex items-center gap-2 text-xs text-primary/70 hover:text-primary mb-7 transition-colors"
            >
              <ArrowRight size={12} />
              {t('Пълен туристически наръчник за Банско', 'Full Bansko Tourist Guide')}
            </Link>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 glass font-medium px-6 py-3 rounded-full hover:bg-secondary transition-all text-sm"
              >
                {t('Назад', 'Back')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full cta-glow hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {t('Продължи', 'Continue')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Enquiry form ── */}
        {step === 3 && (
          <div className="glass rounded-2xl p-6 md:p-8 reveal">
            <h2 className="text-xl font-semibold mb-6">
              {t('3. Изпрати запитване', '3. Send Enquiry')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">
                  {t('Имена', 'Full Name')} *
                </label>
                <input type="text" required value={booking.name}
                  onChange={e => setBooking(b => ({ ...b, name: e.target.value }))}
                  placeholder={t('Вашите имена', 'Your full name')}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">
                  {t('Email', 'Email')} *
                </label>
                <input type="email" required value={booking.email}
                  onChange={e => setBooking(b => ({ ...b, email: e.target.value }))}
                  placeholder={t('вашият@email.com', 'your@email.com')}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">
                  {t('Телефон / WhatsApp', 'Phone / WhatsApp')}
                </label>
                <input type="tel" value={booking.phone}
                  onChange={e => setBooking(b => ({ ...b, phone: e.target.value }))}
                  placeholder="+359 888 ..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs tracking-wide uppercase text-muted-foreground mb-1.5 block">
                  {t('Въпрос / Бележка', 'Question / Note')}
                </label>
                <textarea rows={3} value={booking.message}
                  onChange={e => setBooking(b => ({ ...b, message: e.target.value }))}
                  placeholder={t('Специални изисквания, въпроси...', 'Special requirements, questions...')}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
                />
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl text-xs text-muted-foreground space-y-1 border border-border/30">
                <p><span className="text-foreground font-medium">{t('Пристигане: ', 'Check-in: ')}</span>{booking.checkIn ? formatDate(booking.checkIn, lang) : '—'}</p>
                <p><span className="text-foreground font-medium">{t('Напускане: ', 'Check-out: ')}</span>{booking.checkOut ? formatDate(booking.checkOut, lang) : '—'}</p>
                <p><span className="text-foreground font-medium">{t('Нощи: ', 'Nights: ')}</span>{nights}</p>
                <p><span className="text-foreground font-medium">{t('Гости: ', 'Guests: ')}</span>{booking.guests}</p>
                {totalPrice > 0 && <p><span className="text-foreground font-medium">{t('Ориент. цена: ', 'Est. price: ')}</span><span className="text-primary font-bold">€{totalPrice}</span> <span className="text-muted-foreground/70">(~€{avgNightly}/{t('нощ', 'night')})</span></p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 glass font-medium px-6 py-3 rounded-full hover:bg-secondary transition-all text-sm"
                >
                  {t('Назад', 'Back')}
                </button>
                <button type="submit"
                  className="flex-[2] bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full cta-glow hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  {t('Изпрати запитване', 'Send Enquiry')}
                </button>
              </div>
            </form>

            {/* Direct contact */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center mb-3">
                {t('или се свържи директно', 'or contact directly')}
              </p>
              <a
                href="https://wa.me/359888000000"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full glass rounded-full py-3 text-sm font-medium hover:bg-secondary transition-all"
              >
                <MessageCircle size={16} className="text-primary" />
                {t('WhatsApp — бърз отговор', 'WhatsApp — quick response')}
              </a>
            </div>
          </div>
        )}

        {/* ── Step 4: Success ── */}
        {step === 4 && submitted && (
          <div className="glass rounded-2xl p-10 reveal text-center">
            <div className="w-16 h-16 rounded-full bg-primary/12 flex items-center justify-center mx-auto mb-6">
              <Check size={28} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {t('Запитването е изпратено!', 'Enquiry Sent!')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              {t(
                `Получихме вашето запитване за ${booking.checkIn ? formatDate(booking.checkIn, lang) : ''} — ${booking.checkOut ? formatDate(booking.checkOut, lang) : ''}.`,
                `We received your enquiry for ${booking.checkIn ? formatDate(booking.checkIn, lang) : ''} — ${booking.checkOut ? formatDate(booking.checkOut, lang) : ''}.`
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t(
                'Ще отговорим на посочения email в рамките на 24 часа с потвърждение и цена.',
                "We'll reply to your email within 24 hours with confirmation and pricing."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setStep(1); setBooking({ checkIn:null, checkOut:null, guests:2, name:'', email:'', phone:'', message:'' }); setSubmitted(false) }}
                className="glass font-medium px-8 py-3 rounded-full hover:bg-secondary transition-all text-sm"
              >
                {t('Ново запитване', 'New Enquiry')}
              </button>
              <Link
                href="/bansko"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-lg"
              >
                {t('Разгледай Банско', 'Explore Bansko')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
