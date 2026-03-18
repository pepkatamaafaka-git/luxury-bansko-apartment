'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/navbar'
import {
  ChevronLeft, ChevronRight, X, Plus, Pencil, Check, Trash2,
  CalendarDays, DollarSign, Lock, Moon, Sun, Save,
  Info, AlertCircle, LogOut, Loader2,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type BookingSource = 'manual' | 'booking' | 'airbnb' | 'stripe'
type BookingStatus = 'confirmed' | 'pending' | 'cancelled'

interface Booking {
  id: string
  start_date: string
  end_date: string
  note: string
  source: BookingSource
  status: BookingStatus
  guest_name: string | null
  guest_email: string | null
  total_price: number | null
}

interface PriceRule {
  id: string
  label: string
  months: number[]
  weekday_price: number
  weekend_price: number
}

// ─── Helpers ────────────────────────────────────────────────────
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfWeek(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7 }
function toKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
function fromKey(k: string) { const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d) }

const MONTHS = ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември']
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд']

type Tab = 'calendar' | 'prices'

// ─── Source badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: BookingSource }) {
  const map: Record<BookingSource, string> = {
    manual:  'bg-purple-100 text-purple-700',
    booking: 'bg-blue-100 text-blue-700',
    airbnb:  'bg-red-100 text-red-700',
    stripe:  'bg-green-100 text-green-700',
  }
  const label: Record<BookingSource, string> = {
    manual: 'Ръчно', booking: 'Booking', airbnb: 'Airbnb', stripe: 'Stripe',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[source]}`}>
      {label[source]}
    </span>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setLoginError(data.error ?? 'Невалидни данни')
        return
      }
      const { token } = await res.json()
      onLogin(token)
    } catch {
      setLoginError('Мрежова грешка. Опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock size={22} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold">Админ панел</h1>
            <p className="text-sm text-muted-foreground mt-1">Банско — Св. Иван Рилски</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Потребителско име</label>
              <input type="text" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Парола</label>
              <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            {loginError && (
              <p className="text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={12} />{loginError}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
              {loading ? 'Влизане…' : 'Вход'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [token, setToken] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token')
    if (stored) {
      fetch('/api/admin/auth', { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => { if (r.ok) setToken(stored) })
        .catch(() => {})
        .finally(() => setAuthChecked(true))
    } else {
      setAuthChecked(true)
    }
  }, [])

  function handleLogin(newToken: string) {
    sessionStorage.setItem('admin_token', newToken)
    setToken(newToken)
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {})
    sessionStorage.removeItem('admin_token')
    setToken(null)
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<Booking[]>([])
  const [prices, setPrices] = useState<PriceRule[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>('calendar')

  const authHeaders = useCallback(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token],
  )

  useEffect(() => {
    if (!token) return
    setDataLoading(true)
    Promise.all([
      fetch('/api/admin/bookings', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/admin/prices',   { headers: authHeaders() }).then(r => r.json()),
    ])
      .then(([bData, pData]) => {
        if (Array.isArray(bData)) setBookings(bData)
        if (Array.isArray(pData)) setPrices(pData)
      })
      .catch(() => setDataError('Грешка при зареждане на данни'))
      .finally(() => setDataLoading(false))
  }, [token, authHeaders])

  // ── Calendar state ────────────────────────────────────────────────────────
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectionStart, setSelectionStart] = useState<string | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null)
  const [addNote, setAddNote] = useState('')
  const [addSource, setAddSource] = useState<BookingSource>('manual')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Build occupied key set
  const occupiedKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const b of bookings) {
      if (b.status === 'cancelled') continue
      const s = fromKey(b.start_date)
      const e = fromKey(b.end_date)
      const cur = new Date(s)
      while (cur <= e) { keys.add(toKey(cur)); cur.setDate(cur.getDate() + 1) }
    }
    return keys
  }, [bookings])

  // Get price for a given date
  function getPriceForDate(d: Date) {
    const month = d.getMonth()
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const rule = prices.find(p => p.months.includes(month))
    if (!rule) return null
    return isWeekend ? rule.weekend_price : rule.weekday_price
  }

  // Calendar rendering
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  function handleDayClick(day: number) {
    const key = toKey(new Date(viewYear, viewMonth, day))
    if (!selectionStart) {
      setSelectionStart(key); setSelectionEnd(null)
    } else if (!selectionEnd) {
      if (key < selectionStart) { setSelectionStart(key); setSelectionEnd(selectionStart) }
      else setSelectionEnd(key)
    } else {
      setSelectionStart(key); setSelectionEnd(null)
    }
  }

  function getDayCellClass(day: number) {
    const key = toKey(new Date(viewYear, viewMonth, day))
    const isOccupied = occupiedKeys.has(key)
    const isToday = key === toKey(today)
    const inSel = selectionStart && selectionEnd
      ? key >= selectionStart && key <= selectionEnd
      : key === selectionStart
    const isStart = key === selectionStart
    const isEnd = key === selectionEnd
    let cls = 'relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer select-none '
    if (isOccupied) cls += 'bg-red-100 text-red-700 hover:bg-red-200 '
    else if (inSel && (isStart || isEnd)) cls += 'bg-primary text-primary-foreground '
    else if (inSel) cls += 'bg-primary/20 text-primary '
    else if (isToday) cls += 'ring-2 ring-primary text-primary '
    else cls += 'hover:bg-secondary text-foreground/80 '
    return cls
  }

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  async function addOccupied() {
    if (!selectionStart || !selectionEnd) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ start_date: selectionStart, end_date: selectionEnd, note: addNote || 'Заета дата', source: addSource }),
      })
      if (!res.ok) { const d = await res.json(); setDataError(d.error ?? 'Грешка при добавяне'); return }
      const newBooking: Booking = await res.json()
      setBookings(prev => [...prev, newBooking])
      setSelectionStart(null); setSelectionEnd(null); setAddNote('')
    } catch { setDataError('Мрежова грешка') } finally { setActionLoading(false) }
  }

  async function removeBooking(id: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok || res.status === 204) {
        setBookings(prev => prev.filter(b => b.id !== id))
      } else { const d = await res.json(); setDataError(d.error ?? 'Грешка при изтриване') }
    } catch { setDataError('Мрежова грешка') } finally { setActionLoading(false) }
  }

  async function saveEdit(id: string) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ note: editNote }),
      })
      if (!res.ok) { const d = await res.json(); setDataError(d.error ?? 'Грешка'); return }
      const updated: Booking = await res.json()
      setBookings(prev => prev.map(b => b.id === id ? updated : b))
      setEditingId(null)
    } catch { setDataError('Мрежова грешка') } finally { setActionLoading(false) }
  }

  async function savePrices() {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(prices.map(p => ({ id: p.id, label: p.label, months: p.months, weekday_price: p.weekday_price, weekend_price: p.weekend_price }))),
      })
      if (!res.ok) { const d = await res.json(); setDataError(d.error ?? 'Грешка'); return }
      const updated: PriceRule[] = await res.json()
      setPrices(updated)
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch { setDataError('Мрежова грешка') } finally { setActionLoading(false) }
  }

  // ── Render gates ──────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }
  if (!token) return <LoginForm onLogin={handleLogin} />
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Lock size={11} />
              <span className="tracking-widest uppercase">Админ панел</span>
            </div>
            <h1 className="text-3xl font-bold">Управление на апартамента</h1>
            <p className="text-muted-foreground text-sm mt-1">Банско — Св. Иван Рилски 4★ СПА Ризорт</p>
          </div>
          <div className="flex items-center gap-3">
          <button
            onClick={savePrices}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {actionLoading ? <Loader2 size={15} className="animate-spin" />
              : saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? 'Запазено!' : 'Запази промените'}
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 border border-border px-4 py-3 rounded-xl text-sm font-semibold hover:bg-secondary transition-colors">
            <LogOut size={14} />Изход
          </button>
          </div>
        </div>

        {/* Error banner */}
        {dataError && (
          <div className="mb-6 flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <span className="flex items-center gap-1.5"><AlertCircle size={14} />{dataError}</span>
            <button onClick={() => setDataError('')}><X size={14} /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-secondary rounded-xl w-fit">
          {([
            { id: 'calendar', label: 'Календар & Дати', icon: CalendarDays },
            { id: 'prices',   label: 'Цени',            icon: DollarSign   },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TAB: CALENDAR
        ══════════════════════════════════════ */}
        {tab === 'calendar' && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">

            {/* Calendar */}
            <div className="glass rounded-2xl p-6">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }}
                  className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="font-bold text-lg">
                  {MONTHS[viewMonth]} {viewYear}
                </h2>
                <button
                  onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }}
                  className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />
                  const key = toKey(new Date(viewYear, viewMonth, day))
                  const isOccupied = occupiedKeys.has(key)
                  const price = getPriceForDate(new Date(viewYear, viewMonth, day))

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={getDayCellClass(day)}
                      title={isOccupied ? 'Заето' : `€${price}/нощ`}
                    >
                      {/* Occupied X mark */}
                      {isOccupied && (
                        <X size={10} className="absolute top-0.5 right-0.5 text-red-500" strokeWidth={3} />
                      )}
                      <span className="leading-none">{day}</span>
                      {/* Price hint */}
                      {!isOccupied && price && (
                        <span className="text-[8px] text-muted-foreground leading-none mt-0.5 hidden md:block">
                          €{price}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-border/40 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-red-100 flex items-center justify-center">
                    <X size={9} className="text-red-500" strokeWidth={3} />
                  </span>
                  Заето
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-primary/20" />
                  Избрано
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded ring-2 ring-primary" />
                  Днес
                </span>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4">

              {/* Add Occupied */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-primary" />
                  Добави заета дата
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Начало</label>
                    <input
                      type="date"
                      value={selectionStart || ''}
                      onChange={e => setSelectionStart(e.target.value || null)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Край</label>
                    <input
                      type="date"
                      value={selectionEnd || ''}
                      onChange={e => setSelectionEnd(e.target.value || null)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Бележка</label>
                  <input
                    type="text"
                    placeholder="напр. Резервация Airbnb"
                    value={addNote}
                    onChange={e => setAddNote(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-xs text-muted-foreground mb-1 block">Източник</label>
                  <select
                    value={addSource}
                    onChange={e => setAddSource(e.target.value as BookingSource)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="manual">Ръчно</option>
                    <option value="booking">Booking.com</option>
                    <option value="airbnb">Airbnb</option>
                  </select>
                </div>

                <button
                  onClick={addOccupied}
                  disabled={!selectionStart || !selectionEnd || actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Добави период
                </button>

                {selectionStart && !selectionEnd && (
                  <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                    <Info size={11} />
                    Кликни втора дата в календара за края
                  </p>
                )}
              </div>

              {/* Bookings list */}
              <div className="glass rounded-2xl p-5 flex-1">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CalendarDays size={16} className="text-primary" />
                  Заети периоди
                  <span className="ml-auto text-xs font-normal bg-secondary px-2 py-0.5 rounded-full">
                    {bookings.filter(b => b.status !== 'cancelled').length}
                  </span>
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {bookings.filter(b => b.status !== 'cancelled').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">Няма заети периоди</p>
                  )}
                  {bookings.filter(b => b.status !== 'cancelled').map(b => (
                    <div key={b.id} className="rounded-xl border border-border/50 bg-background/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-medium text-foreground/80">
                              {b.start_date} → {b.end_date}
                            </span>
                            <SourceBadge source={b.source} />
                          </div>
                          {editingId === b.id ? (
                            <div className="flex gap-2 mt-1">
                              <input
                                autoFocus
                                value={editNote}
                                onChange={e => setEditNote(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit(b.id)}
                                className="flex-1 text-xs border border-border rounded-md px-2 py-1 bg-background"
                              />
                              <button onClick={() => saveEdit(b.id)} className="text-primary hover:text-primary/70 transition-colors">
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground truncate">{b.note}</p>
                          )}
                          {b.guest_name && <p className="text-xs text-muted-foreground mt-0.5 truncate">👤 {b.guest_name}</p>}
                          {b.total_price != null && <p className="text-xs text-green-600 font-medium mt-0.5">€{b.total_price}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => { setEditingId(b.id); setEditNote(b.note) }}
                            className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => removeBooking(b.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: PRICES
        ══════════════════════════════════════ */}
        {tab === 'prices' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground glass rounded-xl px-4 py-3">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              Цените са в EUR на нощ. Уикенд = Петък + Събота + Неделя. Натисни &quot;Запази промените&quot; за да запишеш в базата данни.
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {prices.map(rule => (
                <div key={rule.id} className="glass rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h3 className="font-bold text-sm">{rule.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Месеци: {rule.months.map(m => MONTHS[m].substring(0, 3)).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (editingPriceId === rule.id) setEditingPriceId(null)
                        else setEditingPriceId(rule.id)
                      }}
                      className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
                    >
                      {editingPriceId === rule.id ? <><Check size={12} /> Готово</> : <><Pencil size={12} /> Редактирай</>}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Weekday */}
                    <div className="bg-secondary/40 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                        <Moon size={11} />
                        Делник
                      </p>
                      {editingPriceId === rule.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground font-bold">€</span>
                          <input
                            type="number"
                            value={rule.weekday_price}
                            onChange={e => setPrices(prev => prev.map(p =>
                              p.id === rule.id ? { ...p, weekday_price: Number(e.target.value) } : p
                            ))}
                            min={0}
                            className="w-20 text-2xl font-bold text-center border-b-2 border-primary bg-transparent focus:outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-primary">€{rule.weekday_price}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">на нощ</p>
                    </div>

                    {/* Weekend */}
                    <div className="bg-secondary/40 rounded-xl p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                        <Sun size={11} />
                        Уикенд
                      </p>
                      {editingPriceId === rule.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground font-bold">€</span>
                          <input
                            type="number"
                            value={rule.weekend_price}
                            onChange={e => setPrices(prev => prev.map(p =>
                              p.id === rule.id ? { ...p, weekend_price: Number(e.target.value) } : p
                            ))}
                            min={0}
                            className="w-20 text-2xl font-bold text-center border-b-2 border-primary bg-transparent focus:outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-primary">€{rule.weekend_price}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">на нощ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price preview table */}
            <div className="glass rounded-2xl p-6 mt-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Ценова таблица — преглед
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold tracking-wide">Сезон</th>
                      <th className="text-center py-3 px-4 text-xs text-muted-foreground font-semibold tracking-wide">Делник</th>
                      <th className="text-center py-3 px-4 text-xs text-muted-foreground font-semibold tracking-wide">Уикенд</th>
                      <th className="text-center py-3 px-4 text-xs text-muted-foreground font-semibold tracking-wide">Разлика</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((rule, i) => (
                      <tr key={rule.id} className={`border-b border-border/20 ${i % 2 === 0 ? '' : 'bg-secondary/20'}`}>
                        <td className="py-3 px-4 font-medium">{rule.label}</td>
                        <td className="py-3 px-4 text-center text-primary font-bold">€{rule.weekday_price}</td>
                        <td className="py-3 px-4 text-center text-primary font-bold">€{rule.weekend_price}</td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                          +€{rule.weekend_price - rule.weekday_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Save toast */}
        {saved && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold z-50">
            <Check size={16} />
            Промените са запазени!
          </div>
        )}
      </main>
    </div>
  )
}
