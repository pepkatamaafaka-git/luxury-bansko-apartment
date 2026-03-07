'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Star, Waves, Snowflake, TreePine, MapPin } from 'lucide-react'

const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then((m) => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

const images = {
  exterior1: 'https://www.vagabond.bg/sites/default/files/2023-10/st%20ivan%20rilski%20spa%20hotel%20bansko%202.jpg',
  exterior2: 'https://www.kayak.com/rimg/himg/25/2a/e4/expediav2-243347-94095a-677971.jpg?crop=true&height=1200&width=1800',
  exterior3: 'https://www.kayak.com/rimg/himg/59/ee/aa/expedia_group-243347-228136446-311026.jpg?crop=true&height=1200&width=1800',
  spaOutdoor: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%204.jpg',
  spaIndoor: 'https://www.kayak.com/rimg/himg/eb/d7/06/expedia_group-243347-241526524-293890.jpg?crop=true&height=1200&width=1800',
  spaZone: 'https://www.kayak.com/rimg/himg/1f/23/10/expedia_group-243347-229143-270552.jpg?crop=true&height=1200&width=1800',
  lobby: 'https://www.kayak.com/rimg/himg/4b/1b/99/expedia_group-243347-59065685-264917.jpg?crop=true&height=1200&width=1800',
  lounge: 'https://www.kayak.com/rimg/himg/7f/09/a7/expedia_group-243347-3538380-970495.jpg?crop=true&height=1200&width=1800',
  room: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%203.jpg',
}

/* ─── Animated counter hook ───────────────── */
function useCountUp(target: number, duration = 1400, decimals = 0, started: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, duration, decimals])

  return value
}

/* ─── Trust Bar ───────────────────────────── */
function TrustBar() {
  const { t } = useLang()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const v1 = useCountUp(9.7, 1200, 1, started)
  const v2 = useCountUp(4.8, 1200, 1, started)
  const v3 = useCountUp(5, 1000, 0, started)

  return (
    <div ref={containerRef} className="relative z-10 glass mx-4 md:mx-8 -mt-16 rounded-2xl px-6 py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{v1.toFixed(1)}</span>
          <span className="text-lg text-muted-foreground">/10</span>
        </div>
        <span className="text-xs text-muted-foreground tracking-wide">Booking.com</span>
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{v2.toFixed(1)}</span>
          <span className="text-lg text-muted-foreground">/5</span>
        </div>
        <div className="flex gap-0.5 mt-0.5">
          {[1,2,3,4,5].map(s => <Star key={s} size={9} fill="currentColor" className="text-primary" />)}
        </div>
        <span className="text-xs text-muted-foreground tracking-wide">Google Reviews</span>
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{v3}×</span>
        </div>
        <span className="text-xs text-muted-foreground tracking-wide leading-tight text-center">
          {t('Най-добър СПА хотел (БХРА)', 'Best SPA Hotel (BHRA)')}
        </span>
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-3xl md:text-4xl font-bold text-primary">TOP</span>
          <span className="text-xl text-muted-foreground font-bold">100</span>
        </div>
        <span className="text-xs text-muted-foreground tracking-wide leading-tight text-center">
          {t('Хотели България 2025', 'Hotels Bulgaria 2025')}
        </span>
      </div>
    </div>
  )
}

function FeatureCard({
  img, title, desc, href, cta, delay = 0,
}: {
  img: string; title: string; desc: string; href: string; cta: string; delay?: number
}) {
  return (
    <Link
      href={href}
      className="group reveal activity-card flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold mb-2 text-balance">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{desc}</p>
        <span className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
          {cta} <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { t } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <HeroCanvas />

        {/* Gradient overlay — tuned for light backgrounds */}
        <div className="absolute inset-0 hero-overlay-bottom pointer-events-none" />
        <div className="absolute inset-0 hero-overlay-side pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 glass text-xs tracking-widest uppercase px-4 py-2 rounded-full text-foreground/70">
            {season === 'winter' ? (
              <><Snowflake size={12} className="text-primary" /> {t('Зимен сезон • Банско', 'Winter Season • Bansko')}</>
            ) : (
              <><TreePine size={12} className="text-primary" /> {t('Летен сезон • Банско', 'Summer Season • Bansko')}</>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance leading-none text-foreground drop-shadow-sm">
            {season === 'winter'
              ? t('Планинска Зима.', 'Mountain Winter.')
              : t('Планинско Лято.', 'Mountain Summer.')
            }
            <br />
            <span className="text-primary italic">
              {t('Твоето Банско.', 'Your Bansko.')}
            </span>
          </h1>

          <p className="text-base md:text-lg text-foreground/75 mb-10 max-w-xl mx-auto leading-relaxed">
            {t(
              'Двустаен апартамент в СПА Ризорт Св. Иван Рилски — 5× Най-добър 4★ хотел в България.',
              'Two-room apartment at SPA Resort St. Ivan Rilski — 5× Best 4★ Hotel in Bulgaria.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/availability"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full cta-glow hover:opacity-90 transition-all text-base shadow-lg"
            >
              {t('Провери свободни дати', 'Check Availability')}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/resort-spa"
              className="inline-flex items-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-8 py-4 rounded-full transition-all text-base"
            >
              {t('Разгледай СПА', 'Explore SPA')}
            </Link>
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-foreground/50 animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-foreground/60">
            {t('Скрол', 'Scroll')}
          </span>
        </div>
      </section>

      {/* ─── Trust bar ─────────────────────────────────────── */}
      <TrustBar />

      {/* ─── Main sections ─────────────────────────────────── */}
      <div ref={revealRef} className="max-w-7xl mx-auto px-6 mt-24 space-y-32 pb-8">

        {/* About intro */}
        <section className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-widest uppercase text-primary mb-4 font-semibold">
              {t('Апартаментът', 'The Apartment')}
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 reveal text-balance"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            >
              {t(
                'Не просто стая. Домашна база в планината.',
                'Not just a room. A mountain home base.'
              )}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4 reveal" style={{ transitionDelay: '100ms' }}>
              {t(
                'Удобен двустаен апартамент с разделени спалня и дневна — идеален за двойки, семейства или приятели. Пространство за ски екипировка, дълги престои и истинско релаксиране след деня навън.',
                'A comfortable two-room apartment with separate bedroom and living area — ideal for couples, families or friends. Space for ski gear, longer stays, and proper wind-down after a day in the mountains.'
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed reveal" style={{ transitionDelay: '200ms' }}>
              {t(
                'Всички удобства на ризорта са на стъпки — басейни, сауни, ресторанти — без да губиш личното си пространство.',
                'All resort amenities are steps away — pools, saunas, restaurants — without giving up your apartment privacy.'
              )}
            </p>
            <div className="mt-8 flex gap-4 reveal" style={{ transitionDelay: '300ms' }}>
              <Link
                href="/availability"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-md"
              >
                {t('Провери дати', 'Check Dates')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative reveal" style={{ transitionDelay: '150ms' }}>
            <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img
                src={images.lobby}
                alt={t('Лоби на ризорта', 'Resort lobby')}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="currentColor" className="text-primary" />)}
                </div>
                <div>
                  <p className="text-xs font-semibold">9.7 / 10</p>
                  <p className="text-[10px] text-muted-foreground">Booking.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Season feature cards */}
        <section>
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
              {t('Банско — Целогодишно', 'Bansko — Year-Round')}
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold reveal text-balance"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            >
              {t('Едно място. Всички сезони.', 'One Place. Every Season.')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              img={images.spaIndoor}
              title={t('СПА & Уелнес', 'SPA & Wellness')}
              desc={t(
                'Над 1000 кв.м. СПА зона — затоплен вътрешен басейн, финландска сауна, хамам и масажи за дълбок релакс.',
                'Over 1,000 m² of wellness — heated indoor pool, Finnish sauna, hammam, and full treatment menu.'
              )}
              href="/resort-spa"
              cta={t('Разгледай СПА', 'Explore SPA')}
              delay={0}
            />
            <FeatureCard
              img={images.exterior2}
              title={t('Зима в Банско', 'Winter in Bansko')}
              desc={t(
                '75 км писти, 14 лифта, гондола. Ски сутрин, СПА следобед, вечеря в механа — идеалната зимна комбинация.',
                '75 km of runs, 14 lifts, gondola. Ski mornings, SPA afternoons, dinner in a mehana.'
              )}
              href="/bansko"
              cta={t('Виж Банско зиме', 'Winter Guide')}
              delay={100}
            />
            <FeatureCard
              img={images.spaOutdoor}
              title={t('Лято в Планината', 'Summer in the Mountains')}
              desc={t(
                'Пирин — ЮНЕСКО наследство. Еко пътеки, ледникови езера, панорами, следобедно СПА. Летото тук е уникално.',
                'Pirin — UNESCO heritage. Eco trails, glacial lakes, panoramas, afternoon SPA. Summer here is unique.'
              )}
              href="/bansko"
              cta={t('Виж Банско лете', 'Summer Guide')}
              delay={200}
            />
          </div>
        </section>

        {/* SPA teaser — full bleed */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <img
              src={images.spaOutdoor}
              alt={t('Външен басейн на СПА ризорта', 'Outdoor SPA pool')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/10" />
          </div>
          <div className="relative z-10 px-10 md:px-16 py-20 md:py-28 max-w-2xl">
            <p className="text-xs tracking-widest uppercase text-primary mb-4 font-semibold">
              {t('Водна СПА Зона', 'Aqua SPA Zone')}
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold mb-6 text-balance reveal"
              style={{ fontFamily: 'var(--font-serif), serif' }}
            >
              {t('Над 1000 кв.м. чист релакс.', 'Over 1,000 m² of pure relaxation.')}
            </h2>

            <ul className="space-y-3 mb-8">
              {[
                t('Вътрешен акватоничен басейн 36°C, 82 хидромасажни дюзи', 'Indoor aquatonic pool 36°C, 82 hydromassage jets'),
                t('Zewnętrzny basen 34°C + jacuzzi na zewnątrz 36°C', 'Outdoor heated pool 34°C + outdoor Jacuzzi 36°C'),
                t('Финландска сауна ~80°C с планинска гледка', 'Finnish sauna ~80°C with mountain views'),
                t('Adults-only СПА зона (16+) с камина', 'Adults-only SPA zone (16+) with fireplace'),
                t('Хималайска солна сауна, хамам, ароматна парна баня', 'Himalayan salt sauna, hammam, aroma steam bath'),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 reveal text-sm md:text-base" style={{ transitionDelay: `${i * 80}ms` }}>
                  <Waves size={14} className="text-primary mt-1 shrink-0" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/resort-spa"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full cta-glow hover:opacity-90 transition-all reveal shadow-lg"
            >
              {t('Виж целия СПА', 'Explore Full SPA')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Image mosaic */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-2 font-semibold">
                {t('Ризортът', 'The Resort')}
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold reveal"
                style={{ fontFamily: 'var(--font-serif), serif' }}
              >
                {t('СПА Ризорт Св. Иван Рилски', 'SPA Resort St. Ivan Rilski')}
              </h2>
            </div>
            <Link
              href="/gallery"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('Цялата галерия', 'Full gallery')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[images.exterior1, images.exterior3, images.spaZone, images.lounge, images.room, images.exterior2].map(
              (src, i) => (
                <div
                  key={i}
                  className={`reveal overflow-hidden rounded-xl ${i === 0 ? 'md:row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-square'}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <img
                    src={src}
                    alt={t('Снимка на ризорта', 'Resort photo')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )
            )}
          </div>
        </section>

        {/* Location teaser */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm tracking-wide">
              {t('Банско, България — ~10 мин. от гондолата', 'Bansko, Bulgaria — ~10 min from the gondola')}
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 reveal text-balance"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            {t('Готов за планината?', 'Ready for the mountain?')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed reveal" style={{ transitionDelay: '100ms' }}>
            {t(
              'Бързо потвърждение. Ясни цени. Без изненади.',
              'Fast response. Clear pricing. No surprises.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal" style={{ transitionDelay: '200ms' }}>
            <Link
              href="/availability"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-full cta-glow hover:opacity-90 transition-all shadow-lg"
            >
              {t('Провери свободни дати', 'Check Availability')}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-10 py-4 rounded-full transition-all"
            >
              {t('Свържи се с нас', 'Get in touch')}
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
