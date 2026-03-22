'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useEffect, useState } from 'react'
import { Menu, X, Snowflake, Sun, CalendarCheck, ChevronUp } from 'lucide-react'

const navLinks = [
  { href: '/',            bg: 'Начало',           en: 'Home' },
  { href: '/bansko',      bg: 'Банско',           en: 'Bansko' },
  { href: '/resort-spa',  bg: 'СПА Ризорт',       en: 'SPA Resort' },
  { href: '/gallery',     bg: 'Галерия',          en: 'Gallery' },
  { href: '/apartment',   bg: 'Апартамент',        en: 'Apartment' },
]

export function Navbar() {
  const { lang, setLang, t } = useLang()
  const { season, setSeason } = useSeason()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 50)
      setShowTop(y > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ─── Main header ──────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          boxShadow: scrolled ? '0 1px 0 0 var(--border)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}>

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group shrink-0">
              <span
                className="text-[10px] tracking-[0.28em] uppercase text-foreground/50 group-hover:text-primary transition-colors duration-300"
              >
                {t('Апартамент', 'Apartment')}
              </span>
              <span
                className="text-lg font-bold text-foreground tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-serif), serif' }}
              >
                Банско
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg ${
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-foreground/65 hover:text-foreground hover:bg-primary/8'
                  }`}
                >
                  {t(link.bg, link.en)}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Season toggle */}
              <button
                onClick={() => setSeason(season === 'winter' ? 'summer' : 'winter')}
                title={t(
                  season === 'winter' ? 'Превключи към лято' : 'Превключи към зима',
                  season === 'winter' ? 'Switch to summer' : 'Switch to winter'
                )}
                className={`season-btn hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all duration-300 ${
                  season === 'winter'
                    ? 'border-sky-300/60 text-sky-700 bg-sky-50/70 hover:bg-sky-100/80'
                    : 'border-amber-300/60 text-amber-700 bg-amber-50/70 hover:bg-amber-100/80'
                }`}
              >
                {season === 'winter'
                  ? <><Snowflake size={11} /> {t('Зима', 'Winter')}</>
                  : <><Sun size={11} /> {t('Лято', 'Summer')}</>
                }
              </button>

              {/* Lang toggle */}
              <button
                onClick={() => setLang(lang === 'bg' ? 'en' : 'bg')}
                className="text-[11px] tracking-widest uppercase border border-border/60 rounded-full px-3 py-1.5 text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-all duration-200 font-semibold"
              >
                {lang === 'bg' ? 'EN' : 'BG'}
              </button>

              {/* Book CTA */}
              <Link
                href="/availability"
                className="hidden md:flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-full cta-glow transition-all hover:opacity-90 tracking-wide"
              >
                <CalendarCheck size={13} />
                {t('Провери дати', 'Check Dates')}
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-primary/8 text-foreground/80 hover:text-foreground transition-all"
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Затвори меню' : 'Отвори меню'}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll progress bar */}
        <ScrollProgress />
      </header>

      {/* ─── Mobile fullscreen drawer ─────────── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-12">
          <nav className="flex flex-col gap-2 flex-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-3xl font-semibold py-3 border-b border-border/30 transition-all ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:pl-2'
                }`}
                style={{
                  fontFamily: 'var(--font-serif), serif',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {t(link.bg, link.en)}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 mt-8">
            {/* Season toggle mobile */}
            <button
              onClick={() => setSeason(season === 'winter' ? 'summer' : 'winter')}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                season === 'winter'
                  ? 'border-sky-300/60 text-sky-700 bg-sky-50/50'
                  : 'border-amber-300/60 text-amber-700 bg-amber-50/50'
              }`}
            >
              {season === 'winter'
                ? <><Snowflake size={14} /> {t('Превключи към лято', 'Switch to Summer')}</>
                : <><Sun size={14} /> {t('Превключи към зима', 'Switch to Winter')}</>
              }
            </button>
            <Link
              href="/availability"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-8 py-4 rounded-2xl cta-glow"
            >
              <CalendarCheck size={16} />
              {t('Провери свободни дати', 'Check Availability')}
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Mobile bottom CTA ────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 py-3 flex gap-3"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <Link
          href="/availability"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-3 rounded-xl cta-glow"
        >
          <CalendarCheck size={15} />
          {t('Провери дати', 'Check Dates')}
        </Link>
        <a
          href="https://wa.me/359888000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 glass text-foreground/70 font-medium text-sm px-4 py-3 rounded-xl"
        >
          WA
        </a>
      </div>

      {/* ─── Back to top button ───────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-24 right-5 z-50 md:bottom-8 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:opacity-90 hover:scale-110 ${
          showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronUp size={20} />
      </button>
    </>
  )
}

function ScrollProgress() {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const pct = (window.scrollY / (el.scrollHeight - el.clientHeight)) * 100
      setWidth(Math.min(pct, 100))
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-transparent">
      <div
        className="h-full bg-primary transition-none"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
