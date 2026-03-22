'use client'

import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight, Star, Award, Waves, Thermometer, Dumbbell, Heart, Zap, Sparkles, Clock, Users, Check } from 'lucide-react'

const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then(m => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

const images = {
  pool: 'https://www.kayak.com/rimg/himg/eb/d7/06/expedia_group-243347-241526524-293890.jpg?crop=true&height=1200&width=1800',
  spa: 'https://www.kayak.com/rimg/himg/1f/23/10/expedia_group-243347-229143-270552.jpg?crop=true&height=1200&width=1800',
  exterior: 'https://www.vagabond.bg/sites/default/files/2023-10/st%20ivan%20rilski%20spa%20hotel%20bansko%202.jpg',
  lobby: 'https://www.kayak.com/rimg/himg/4b/1b/99/expedia_group-243347-59065685-264917.jpg?crop=true&height=1200&width=1800',
  lounge: 'https://www.kayak.com/rimg/himg/7f/09/a7/expedia_group-243347-3538380-970495.jpg?crop=true&height=1200&width=1800',
  room: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%203.jpg',
}

const SPA_ZONES = [
  {
    icon: Waves,
    name: { bg: 'Вътрешен минерален басейн', en: 'Indoor Mineral Pool' },
    detail: { bg: '36°C • Минерална вода • Целогодишно', en: '36°C • Mineral Water • Year-round' },
    desc: { bg: 'Топъл вътрешен басейн с минерална вода — 36°C целогодишно. Идеален за отпускане след ски деня или планинска разходка. Гледка към снежните върхове.', en: 'Warm indoor mineral pool — 36°C year-round. Ideal for unwinding after a ski day or mountain hike. Views of the snowy peaks.' },
  },
  {
    icon: Thermometer,
    name: { bg: 'Финландска сауна', en: 'Finnish Sauna' },
    detail: { bg: '80–90°C • Ароматерапия • Планинска гледка', en: '80–90°C • Aromatherapy • Mountain view' },
    desc: { bg: 'Автентична финландска сауна с дървени пейки и ароматни масла. Пълно детоксикиране и мускулно отпускане. Специални парни сесии с аромат на евкалипт.', en: 'Authentic Finnish sauna with wooden benches and aromatic oils. Full detox and muscle relaxation. Special steam sessions with eucalyptus aroma.' },
  },
  {
    icon: Heart,
    name: { bg: 'Хамам & Парна баня', en: 'Hammam & Steam Room' },
    detail: { bg: 'Мраморни плочи • 42°C • Пееlinг', en: 'Marble Slabs • 42°C • Peeling' },
    desc: { bg: 'Традиционен турски хамам с мраморни плочи. Пиеlinг на тялото, кал маски и традиционен масаж с пяна. Парна баня с евкалипт за респираторно здраве.', en: 'Traditional Turkish hammam with marble slabs. Body peeling, mud masks and traditional foam massage. Eucalyptus steam room for respiratory wellness.' },
  },
  {
    icon: Zap,
    name: { bg: 'Джакузи & Хидромасаж', en: 'Jacuzzi & Hydromassage' },
    detail: { bg: 'Вихрови струи • 38°C • Релакс зона', en: 'Whirlpool Jets • 38°C • Relaxation Zone' },
    desc: { bg: 'Вихрова вана с мощни хидромасажни струи за дълбоко мускулно отпускане. Перфектна за ски травми и умора след активен ден.', en: 'Whirlpool tub with powerful hydromassage jets for deep muscle relaxation. Perfect for ski injuries and fatigue after an active day.' },
  },
  {
    icon: Dumbbell,
    name: { bg: 'Модерен фитнес', en: 'Modern Fitness Centre' },
    detail: { bg: 'Кардио • Тежести • Свободен достъп', en: 'Cardio • Weights • Free Access' },
    desc: { bg: 'Напълно оборудвана фитнес зала с тредмили, велоергометри, гири и машини. Свободен достъп за гостите. Перфектна за поддържане на форма дори по ваканция.', en: 'Fully equipped gym with treadmills, bikes, free weights and machines. Free access for guests. Perfect for staying in shape even on holiday.' },
  },
  {
    icon: Sparkles,
    name: { bg: 'СПА процедури', en: 'SPA Treatments' },
    detail: { bg: 'Масажи • Козметика • По резервация', en: 'Massages • Beauty • By Appointment' },
    desc: { bg: 'Пълно меню от СПА процедури — класически и ароматни масажи, козметични процедури за лице, ароматерапия. Специални оферти за гостите на апартамента.', en: 'Full SPA menu — classic and aromatic massages, facial treatments, aromatherapy. Special offers for apartment guests.' },
  },
]

const AWARDS = [
  { text: { bg: '9.7/10 Booking.com', en: '9.7/10 Booking.com' }, sub: { bg: 'Oценка на гостите', en: 'Guest Score' } },
  { text: { bg: '5× Най-добър СПА хотел', en: '5× Best SPA Hotel' }, sub: { bg: 'БХРА', en: 'BHRA' } },
  { text: { bg: 'TOP 100', en: 'TOP 100' }, sub: { bg: 'Хотели България', en: 'Hotels Bulgaria' } },
  { text: { bg: '4 звезди', en: '4 Stars' }, sub: { bg: 'Официален рейтинг', en: 'Official Rating' } },
]

export default function ResortSPAPage() {
  const { t, lang } = useLang()
  const revealRef = useScrollReveal()

  return (
    <div className="min-h-screen text-foreground page-enter" style={{ background: 'transparent' }}>
      {/* Shared mountain background — same as home page */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <HeroCanvas />
      </div>

      {/* ─── Hero ─────────────────────────────── */}
      <section className="relative pt-36 pb-28 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="flex-1">
              <div className="tag-pill mb-6">{t('4 Звезди • Банско, България', '4 Stars • Bansko, Bulgaria')}</div>
              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight mb-5">
                {t('Св. Иван Рилски', 'St. Ivan Rilski')}
                <br />
                <span className="text-primary italic">{t('СПА Ризорт', 'SPA Resort')}</span>
              </h1>
              <p className="text-lg text-foreground/70 max-w-xl leading-relaxed mb-8">
                {t('Над 1000 кв.м. СПА зона, внимателно обслужване и панорамна гледка към Пирин. Признат за най-добър СПА хотел в България 5 последователни години.',
                   'Over 1,000 m² of wellness, attentive service and panoramic Pirin views. Recognised as Bulgaria\'s Best SPA Hotel 5 consecutive years.')}
              </p>
              <div className="flex gap-3">
                <Link href="/reserve" className="inline-flex items-center gap-2 btn-gradient font-semibold px-7 py-3.5 rounded-full cta-glow">
                  {t('Резервирай сега', 'Reserve Now')} <ArrowRight size={15} />
                </Link>
                <Link href="/availability" className="inline-flex items-center gap-2 glass text-foreground/70 hover:text-foreground font-medium px-7 py-3.5 rounded-full transition-all">
                  {t('Провери дати', 'Check Dates')}
                </Link>
              </div>
            </div>
            {/* Image stack */}
            <div className="flex-1 relative h-72 lg:h-96">
              <img src={images.exterior} alt="Resort exterior" className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl" />
              <img src={images.pool} alt="Indoor pool" className="absolute -bottom-6 -right-4 w-40 h-28 object-cover rounded-2xl shadow-xl border-2 border-background" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Awards bar ───────────────────────── */}
      <div className="bg-primary text-primary-foreground py-5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {AWARDS.map((a, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-0.5">
              <div className="flex items-center gap-1.5">
                <Star size={12} fill="currentColor" />
                <span className="font-bold text-base">{a.text[lang as 'bg'|'en'] ?? a.text.bg}</span>
              </div>
              <span className="text-xs text-primary-foreground/70">{a.sub[lang as 'bg'|'en'] ?? a.sub.bg}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={revealRef} className="relative max-w-7xl mx-auto px-6 py-20 space-y-24 pb-24" style={{ zIndex: 1 }}>

        {/* ─── SPA zones ────────────────────────── */}
        <section>
          <div className="section-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal">{t('СПА Зона', 'SPA Zone')}</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl leading-relaxed reveal">
            {t('Над 1000 кв.м. уелнес зона — включена безплатно за всички гости на апартамента.', 'Over 1,000 m² of wellness — included free for all apartment guests.')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPA_ZONES.map(({ icon: Icon, name, detail, desc }, i) => (
              <div key={i} className="reveal glass rounded-2xl p-6 activity-card" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 btn-gradient">
                  <Icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">{name[lang as 'bg'|'en'] ?? name.bg}</h3>
                <p className="text-[11px] text-primary font-medium mb-3">{detail[lang as 'bg'|'en'] ?? detail.bg}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc[lang as 'bg'|'en'] ?? desc.bg}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Photo mosaic ─────────────────────── */}
        <section className="reveal">
          <div className="section-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('Галерия', 'Gallery')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[images.pool, images.spa, images.lobby, images.lounge, images.room, images.exterior].map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl activity-card ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`} style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}>
                <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/gallery" className="inline-flex items-center gap-2 glass text-foreground/70 hover:text-foreground font-medium px-6 py-3 rounded-full transition-all text-sm">
              {t('Пълна галерия', 'Full Gallery')} <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ─── Included in apartment ────────────── */}
        <section className="reveal">
          <div className="section-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('Включено в апартамента', 'Included in the Apartment')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-2xl p-7">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Check size={16} className="text-primary" />{t('Услуги на ризорта', 'Resort Services')}</h3>
              <ul className="space-y-3">
                {(lang === 'bg' ? [
                  'Неограничен достъп до цялата СПА зона',
                  'Отопляем вътрешен минерален басейн 36°C',
                  'Финландска сауна, хамам и парна баня',
                  'Модерен фитнес — свободен достъп',
                  'Безплатен Wi-Fi в целия ризорт',
                  'Паркинг (при наличност)',
                  'Денонощна рецепция',
                  'Крайно почистване',
                ] : [
                  'Unlimited access to the full SPA zone',
                  'Heated indoor mineral pool 36°C',
                  'Finnish sauna, hammam and steam room',
                  'Modern gym — free access',
                  'Free Wi-Fi throughout the resort',
                  'Parking (subject to availability)',
                  '24-hour reception',
                  'Final cleaning',
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-7">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={16} className="text-primary" />{t('Апартаментът', 'The Apartment')}</h3>
              <ul className="space-y-3">
                {(lang === 'bg' ? [
                  'Двустаен апартамент — до 6 гости',
                  'Напълно оборудвана кухня',
                  'Дневна и отделна спалня',
                  'Хол с камина (зимен сезон)',
                  'Тераса с планинска гледка',
                  'Климатик / климатизация',
                  'Smart TV с кабелна телевизия',
                  'Бебешко креватче (при заявка)',
                ] : [
                  '2-bedroom apartment — up to 6 guests',
                  'Fully equipped kitchen',
                  'Living room and separate bedroom',
                  'Lounge with fireplace (winter season)',
                  'Terrace with mountain view',
                  'Air conditioning / heating',
                  'Smart TV with cable TV',
                  'Baby cot (on request)',
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Opening hours ────────────────────── */}
        <section className="reveal">
          <div className="section-line mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('Работно Време на СПА', 'SPA Operating Hours')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { zone: { bg: 'Вътрешен басейн', en: 'Indoor Pool' }, hours: '07:00 – 22:00' },
              { zone: { bg: 'Финландска сауна', en: 'Finnish Sauna' }, hours: '09:00 – 21:00' },
              { zone: { bg: 'Хамам & Парна баня', en: 'Hammam & Steam' }, hours: '10:00 – 21:00' },
              { zone: { bg: 'Джакузи', en: 'Jacuzzi' }, hours: '09:00 – 21:00' },
              { zone: { bg: 'Фитнес зала', en: 'Fitness Centre' }, hours: '07:00 – 22:00' },
              { zone: { bg: 'СПА процедури', en: 'SPA Treatments' }, hours: t('По резервация', 'By Appointment') },
            ] as const).map((z, i) => (
              <div key={i} className="glass rounded-xl px-5 py-4 flex items-center justify-between activity-card">
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span className="text-sm font-medium">{z.zone[lang as 'bg'|'en'] ?? z.zone.bg}</span>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums">{z.hours}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────── */}
        <section className="reveal text-center py-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('Готов за релакс?', 'Ready to Relax?')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            {t('Резервирай апартамента и получи пълен достъп до СПА зоната.', 'Reserve the apartment and get full access to the SPA zone.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reserve" className="inline-flex items-center justify-center gap-2 btn-gradient font-semibold px-10 py-4 rounded-full cta-glow text-base">
              {t('Резервирай сега', 'Reserve Now')} <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 glass text-foreground/70 hover:text-foreground font-medium px-10 py-4 rounded-full transition-all text-base">
              {t('Задай въпрос', 'Ask a Question')}
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  )
}
