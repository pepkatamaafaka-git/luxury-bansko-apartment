'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { useState } from 'react'
import {
  ArrowRight,
  Snowflake,
  TreePine,
  MapPin,
  Mountain,
  Cable,
  Clock,
  Beer,
  Utensils,
  Music2,
  ChevronDown,
  ChevronUp,
  Bike,
  Camera,
  Waves,
  Wind,
  Flame,
  Footprints,
  Dumbbell,
  Thermometer,
  Zap,
  Heart,
  Trophy,
} from 'lucide-react'

const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then((m) => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

const BanskoMap = dynamic(
  () => import('@/components/bansko-map').then((m) => m.BanskoMap),
  { ssr: false, loading: () => <div className="w-full rounded-2xl bg-secondary animate-pulse" style={{ height: 420 }} /> }
)

type SlopeLevel = 'green' | 'blue' | 'red' | 'black'
type Slope = { name: string; level: SlopeLevel; km: number; lift: string }

const SKI_RUNS: Slope[] = [
  { name: 'Шилигарника', level: 'blue', km: 3.2, lift: 'Гондола' },
  { name: 'Бъндеришка поляна', level: 'red', km: 4.5, lift: 'ЛС Бъндерица' },
  { name: 'Платото', level: 'red', km: 5.1, lift: 'ЛС Платото' },
  { name: 'Северен склон', level: 'black', km: 2.8, lift: 'ЛС Тодорка' },
  { name: 'Тодорка', level: 'black', km: 6.2, lift: 'ЛС Тодорка' },
  { name: 'Детска писта', level: 'green', km: 0.8, lift: 'Детски влек' },
]

const LIFTS = [
  { name: 'Гондола', type: 'Кабинкова', capacity: 2400, alt: '1100 → 1940 м' },
  { name: 'ЛС Бъндерица', type: 'Седалкова', capacity: 1800, alt: '1920 → 2480 м' },
  { name: 'ЛС Платото', type: 'Седалкова', capacity: 1800, alt: '2050 → 2560 м' },
  { name: 'ЛС Тодорка', type: 'Седалкова', capacity: 2000, alt: '2200 → 2600 м' },
  { name: 'ЛС Чалин Валог', type: 'Седалкова', capacity: 1600, alt: '1490 → 1910 м' },
]

const SUMMER_TRAILS = [
  {
    name: 'Банско → Вихрен',
    duration: '5–6 ч',
    distance: '14 км',
    difficulty: 'hard',
    elevation: '+1200 м',
    desc: {
      bg: 'Класическият маршрут — минава през Бъндерица и достига до най-високия връх в Пирин (2914 м).',
      en: 'The classic route — through Banderitsa to Vihren peak (2914 m), the highest in Pirin.',
    },
  },
  {
    name: 'Бъндерица → Езерата',
    duration: '3–4 ч',
    distance: '9 км',
    difficulty: 'medium',
    elevation: '+600 м',
    desc: {
      bg: 'Семеен преход до ледникови езера — кристална вода, диви цветя, панорами.',
      en: 'A family hike to glacial lakes — crystal water, wildflowers, panoramas.',
    },
  },
  {
    name: 'Демянишки водопад',
    duration: '2–3 ч',
    distance: '6 км',
    difficulty: 'easy',
    elevation: '+350 м',
    desc: {
      bg: 'Кратък горски преход до живописен водопад — перфектен за семейства.',
      en: 'Short forest hike to a scenic waterfall — great for families.',
    },
  },
]

const BARS = [
  { name: 'Happy End Bar', type: 'apreski', hours: '14:00–03:00', desc: { bg: 'Най-популярният апре-ски бар — точно до пистата.', en: 'Most popular apres-ski bar — right at the slope.' } },
  { name: 'Amigos Bar', type: 'apreski', hours: '12:00–02:00', desc: { bg: 'Класически апре-ски с коктейли и атмосфера.', en: 'Classic apres-ski with cocktails and vibes.' } },
  { name: "Niko's Bar & Grill", type: 'bar', hours: '11:00–00:00', desc: { bg: 'Уютен бар-ресторант в стария град.', en: 'Cosy bar-restaurant in the old town.' } },
  { name: 'Underground Club', type: 'club', hours: '22:00–06:00', desc: { bg: 'Клуб с DJ — до зори.', en: 'DJ club — until dawn.' } },
  { name: 'Kasapinova Kashta', type: 'mehana', hours: '18:00–01:00', desc: { bg: 'Автентична механа с жива музика.', en: 'Authentic mehana with live music.' } },
  { name: 'Obshtata Kushta', type: 'mehana', hours: '12:00–23:00', desc: { bg: 'Традиционна кухня и много добра атмосфера.', en: 'Traditional cuisine and great atmosphere.' } },
]

const SUMMER_ACTIVITIES = [
  { icon: Bike, name: { bg: 'МТБ & Колоездене', en: 'MTB & Cycling' }, desc: { bg: 'Трасета за колоездене и e-bike около Банско.', en: 'MTB and e-bike routes around Bansko.' } },
  { icon: Camera, name: { bg: 'Фотография & Природа', en: 'Photography & Nature' }, desc: { bg: 'Пирин е пълен с панорами и диви места.', en: 'Pirin is full of panoramas and wild spots.' } },
  { icon: Waves, name: { bg: 'Риболов', en: 'Fishing' }, desc: { bg: 'Реки и язовири с пъстърва около Банско.', en: 'Rivers and reservoirs with trout around Bansko.' } },
  { icon: Wind, name: { bg: 'Параглайдинг', en: 'Paragliding' }, desc: { bg: 'Тандемни полети над Пирин.', en: 'Tandem flights over Pirin.' } },
  { icon: Flame, name: { bg: 'Банско Джаз Фест', en: 'Bansko Jazz Fest' }, desc: { bg: 'Лятото = музика в стария град.', en: 'Summer = music in the old town.' } },
  { icon: Footprints, name: { bg: 'Стар Банско', en: 'Old Bansko' }, desc: { bg: 'Вечерни разходки, механи и уют.', en: 'Evening walks, mehanas and cosy vibes.' } },
]

const FITNESS_FACILITIES = [
  { icon: Dumbbell, name: { bg: 'Фитнес зала', en: 'Fitness Centre' }, desc: { bg: 'Модерна зала с кардио и тежести.', en: 'Modern gym with cardio and weights.' } },
  { icon: Waves, name: { bg: 'Вътрешен басейн', en: 'Indoor Pool' }, desc: { bg: 'Топъл басейн — целогодишно.', en: 'Warm pool — year-round.' } },
  { icon: Thermometer, name: { bg: 'Сауни & парна', en: 'Saunas & Steam' }, desc: { bg: 'Сесии за детокс и релакс.', en: 'Detox + relaxation sessions.' } },
  { icon: Zap, name: { bg: 'Джакузи', en: 'Jacuzzi' }, desc: { bg: 'Възстановяване след активен ден.', en: 'Recovery after an active day.' } },
  { icon: Heart, name: { bg: 'Adult SPA (16+)', en: 'Adults SPA (16+)' }, desc: { bg: 'Тишина, уединение, релакс зона.', en: 'Silence, privacy, relaxation area.' } },
  { icon: Trophy, name: { bg: 'СПА процедури', en: 'SPA Treatments' }, desc: { bg: 'Масажи и терапии с резервация.', en: 'Massages and therapies by appointment.' } },
]

function DifficultyBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    black: 'bg-neutral-900 text-white border-neutral-700',
    easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-red-100 text-red-700 border-red-200',
  }
  const label: Record<string, string> = {
    green: 'Зелена', blue: 'Синя', red: 'Червена', black: 'Черна',
    easy: 'Лесен', medium: 'Среден', hard: 'Труден',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[level] || ''}`}>
      {label[level] || level}
    </span>
  )
}

export default function BanskoPage() {
  const { t, lang } = useLang()
  const { season, setSeason } = useSeason()
  const revealRef = useScrollReveal()

  const isWinter = season === 'winter'
  const [expandedTrail, setExpandedTrail] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">

      {/* HERO — 1:1 като Home */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <HeroCanvas />

        {/* Same overlays as Home */}
        <div className="absolute inset-0 hero-overlay-bottom pointer-events-none" />
        <div className="absolute inset-0 hero-overlay-side pointer-events-none" />

        <div className="relative z-10 px-6 max-w-5xl mx-auto w-full">
          <div className="mb-4 inline-flex items-center gap-2 glass text-xs tracking-widest uppercase px-4 py-2 rounded-full text-foreground/70">
            {isWinter ? (
              <>
                <Snowflake size={12} className="text-primary" />
                {t('Зимен гид • Банско', 'Winter Guide • Bansko')}
              </>
            ) : (
              <>
                <TreePine size={12} className="text-primary" />
                {t('Летен гид • Банско', 'Summer Guide • Bansko')}
              </>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance leading-none text-foreground drop-shadow-sm">
            {isWinter ? t('Зима в Банско.', 'Winter in Bansko.') : t('Лято в Банско.', 'Summer in Bansko.')}
            <br />
            <span className="text-primary italic">{t('Какво да правиш.', 'What to do.')}</span>
          </h1>

          <p className="text-base md:text-lg text-foreground/75 mb-10 max-w-2xl leading-relaxed">
            {isWinter
              ? t(
                  'Ски сутрин, апре-ски вечер, а между тях — топъл басейн и сауни. Ето най-добрия план.',
                  'Ski in the morning, apres-ski at night, and in between — warm pools and saunas. Here’s the best plan.'
                )
              : t(
                  'Еко пътеки, ледникови езера и свеж въздух — следобедно СПА и вечерна разходка в стария град.',
                  'Eco trails, glacial lakes and fresh air — afternoon SPA and an evening stroll through the old town.'
                )}
          </p>

          {/* сезонни бутони — НЕ променям цветовете, същите като Home */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setSeason('winter')}
              className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all text-sm ${
                isWinter
                  ? 'bg-primary text-primary-foreground cta-glow shadow-lg hover:opacity-90'
                  : 'glass text-foreground/80 hover:text-foreground'
              }`}
              type="button"
            >
              <Snowflake size={14} /> {t('Зима', 'Winter')}
            </button>

            <button
              onClick={() => setSeason('summer')}
              className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all text-sm ${
                !isWinter
                  ? 'bg-primary text-primary-foreground cta-glow shadow-lg hover:opacity-90'
                  : 'glass text-foreground/80 hover:text-foreground'
              }`}
              type="button"
            >
              <TreePine size={14} /> {t('Лято', 'Summer')}
            </button>

            <div className="sm:ml-auto flex gap-3">
              <Link
                href="#map"
                className="inline-flex items-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-6 py-3 rounded-full transition-all text-sm"
              >
                <MapPin size={14} /> {t('Карта', 'Map')}
              </Link>
              <Link
                href="/availability"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-7 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-lg"
              >
                {t('Провери свободни дати', 'Check Availability')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator — като Home */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-foreground/50 animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-foreground/60">
            {t('Скрол', 'Scroll')}
          </span>
        </div>
      </section>

      {/* Content below uses normal background (както Home) */}
      <div ref={revealRef} className="max-w-7xl mx-auto px-6 mt-24 space-y-24 pb-8">
        {/* MAP */}
        {/* MAP */}
<section id="map" className="relative">
  <div className="flex items-end justify-between gap-6 mb-8">
    <div>
      <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
        {t('Ориентация', 'Orientation')}
      </p>
      <h2
        className="text-3xl md:text-4xl font-bold reveal"
        style={{ fontFamily: 'var(--font-serif), serif' }}
      >
        {t('Карта на Банско', 'Map of Bansko')}
      </h2>
      <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed reveal" style={{ transitionDelay: '100ms' }}>
        {t(
          'Апартаментът, гондолата, барове, механи и пътеки — всичко на едно място.',
          'Apartment, gondola, bars, mehanas and trails — everything in one place.'
        )}
      </p>
    </div>

    <Link
      href="/reserve"
      className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-lg"
    >
      {t('Резервирай сега', 'Reserve Now')} <ArrowRight size={14} />
    </Link>
  </div>

  {/* IMPORTANT: isolate + fixed height + overflow hidden */}
  <div className="relative isolate overflow-hidden rounded-2xl border border-border/40 bg-card">
    <div className="relative h-[420px] w-full">
      <BanskoMap tab={season} lang={lang} />
    </div>
  </div>
</section>

        {/* WINTER */}
        {isWinter && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '75', unit: ' км', label: t('Ски писти', 'Ski Runs') },
                { val: '14', unit: '', label: t('Лифтове', 'Lifts') },
                { val: '1100', unit: '→2600м', label: t('Денивелация', 'Elevation') },
                { val: '~130', unit: ' дни', label: t('Ски сезон', 'Ski Season') },
              ].map((s, i) => (
                <div
                  key={i}
                  className="reveal activity-card rounded-2xl border border-border/40 bg-card p-6 text-center"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                    {s.val}
                    <span className="text-base text-muted-foreground font-normal">{s.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 tracking-wide">{s.label}</div>
                </div>
              ))}
            </section>

            <section className="reveal rounded-3xl border border-border/40 bg-card p-8 md:p-12">
              <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
                {t('Ски зона', 'Ski Area')}
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: 'var(--font-serif), serif' }}
              >
                {t('Писти & гондола', 'Pistes & Gondola')}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                {t(
                  'Сутрин — гондола и писти. Вечер — апре-ски и механи. После — топъл басейн и сауни.',
                  'Morning — gondola and pistes. Evening — apres-ski and mehanas. Then — warm pool and saunas.'
                )}
              </p>

              <div className="space-y-3">
                {SKI_RUNS.map((run, i) => (
                  <div
                    key={i}
                    className="reveal flex items-center justify-between rounded-xl border border-border/40 bg-background/60 px-5 py-4"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Mountain size={16} className="text-primary shrink-0" />
                      <span className="font-medium text-sm">{run.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="hidden sm:block">{run.lift}</span>
                      <span className="tabular-nums font-medium">{run.km} km</span>
                      <DifficultyBadge level={run.level} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
                    {t('Инфо', 'Info')}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold reveal" style={{ fontFamily: 'var(--font-serif), serif' }}>
                    {t('Лифтове', 'Lifts')}
                  </h2>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LIFTS.map((lift, i) => (
                  <div
                    key={i}
                    className="reveal activity-card rounded-2xl border border-border/40 bg-card p-5"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Cable size={16} className="text-primary" />
                      <h3 className="font-semibold text-sm">{lift.name}</h3>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        {lift.type} • {lift.capacity} {t('ос/ч', 'ppl/h')}
                      </p>
                      <p className="font-medium text-foreground">{lift.alt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
                {t('След ски', 'After Ski')}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold reveal mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                {t('Апре-ски & нощен живот', 'Apres-ski & Nightlife')}
              </h2>
              <p className="text-muted-foreground mb-8 reveal" style={{ transitionDelay: '100ms' }}>
                {t('Барове, механи, клубове — Банско има ритъм.', 'Bars, mehanas, clubs — Bansko has rhythm.')}
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {BARS.map((bar, i) => (
                  <div
                    key={i}
                    className="reveal activity-card rounded-2xl border border-border/40 bg-card p-5"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{bar.name}</h3>
                      <span className="text-primary">
                        {bar.type === 'club' ? (
                          <Music2 size={14} />
                        ) : bar.type === 'mehana' ? (
                          <Utensils size={14} />
                        ) : (
                          <Beer size={14} />
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {bar.desc[lang as 'bg' | 'en'] ?? bar.desc.bg}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                      <Clock size={11} /> {bar.hours}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* SUMMER */}
        {!isWinter && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { val: '2914', unit: ' м', label: t('Вихрен', 'Vihren') },
                { val: 'Езера', unit: '', label: t('Ледникови маршрути', 'Glacial Routes') },
                { val: 'Пирин', unit: '', label: t('Еко пътеки', 'Eco Trails') },
                { val: 'Август', unit: '', label: t('Джаз фестивал', 'Jazz Festival') },
              ].map((s, i) => (
                <div
                  key={i}
                  className="reveal activity-card rounded-2xl border border-border/40 bg-card p-6 text-center"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {s.val}
                    <span className="text-base text-muted-foreground font-normal">{s.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 tracking-wide">{s.label}</div>
                </div>
              ))}
            </section>

            <section>
              <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
                {t('Пирин', 'Pirin')}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold reveal mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
                {t('Еко пътеки & преходи', 'Eco Trails & Hikes')}
              </h2>
              <p className="text-muted-foreground mb-8 reveal" style={{ transitionDelay: '100ms' }}>
                {t('Лято = преходи сутрин, СПА следобед.', 'Summer = hikes in the morning, SPA in the afternoon.')}
              </p>

              <div className="space-y-3">
  {SUMMER_TRAILS.map((trail, i) => {
    const open = expandedTrail === i

    return (
      <div
        key={i}
        className={[
          "reveal activity-card rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-300",
          open ? "shadow-xl ring-1 ring-primary/25" : "hover:border-primary/25 hover:shadow-lg",
        ].join(" ")}
        style={{ transitionDelay: `${i * 40}ms` }}
      >
        <button
          onClick={() => setExpandedTrail(open ? null : i)}
          className={[
            "w-full text-left px-5 py-4 transition-all duration-300",
            "flex items-center justify-between gap-4",
            open ? "bg-primary/5" : "hover:bg-secondary/60",
          ].join(" ")}
          type="button"
          aria-expanded={open}
        >
          {/* Left: icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={[
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                open ? "bg-primary/12" : "bg-primary/8",
              ].join(" ")}
            >
              <TreePine size={18} className="text-primary" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm md:text-[15px] truncate">
                  {trail.name}
                </span>
                {open && (
                  <span className="hidden sm:inline-flex text-[10px] tracking-widest uppercase text-primary font-semibold">
                    {t("Маршрут", "Trail")}
                  </span>
                )}
              </div>

              {/* Subline */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/60 px-2 py-0.5">
                  <Clock size={11} className="text-primary/80" />
                  {trail.duration}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/60 px-2 py-0.5 tabular-nums">
                  {trail.distance}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/60 px-2 py-0.5 font-medium text-primary tabular-nums">
                  {trail.elevation}
                </span>
              </div>
            </div>
          </div>

          {/* Right: difficulty + chevron */}
          <div className="flex items-center gap-3 shrink-0">
            <DifficultyBadge level={trail.difficulty} />
            <div
              className={[
                "w-9 h-9 rounded-full border border-border/40 flex items-center justify-center transition-all duration-300",
                open ? "bg-primary text-primary-foreground border-primary/30" : "bg-background/60",
              ].join(" ")}
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>

        {/* Animated content */}
        <div
          className={[
            "grid transition-[grid-template-rows] duration-300 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="px-5 pb-5 pt-0 border-t border-border/30">
              <div className="pt-4 flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mountain size={16} className="text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {trail.desc[lang as "bg" | "en"] ?? trail.desc.bg}
                  </p>

                  {/* Mini “tips” row (optional but looks premium) */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-[11px] rounded-full border border-border/40 bg-background/60 px-3 py-1 text-muted-foreground">
                      {t("Носете вода", "Bring water")}
                    </span>
                    <span className="text-[11px] rounded-full border border-border/40 bg-background/60 px-3 py-1 text-muted-foreground">
                      {t("Проверете времето", "Check weather")}
                    </span>
                    <span className="text-[11px] rounded-full border border-border/40 bg-background/60 px-3 py-1 text-muted-foreground">
                      {t("Сутрин е най-добре", "Best in the morning")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  })}
</div>
            </section>

            <section>
              <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
                {t('Идеи', 'Ideas')}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold reveal mb-8" style={{ fontFamily: 'var(--font-serif), serif' }}>
                {t('Летни активности', 'Summer Activities')}
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {SUMMER_ACTIVITIES.map(({ icon: Icon, name, desc }, i) => (
                  <div
                    key={i}
                    className="reveal activity-card rounded-2xl border border-border/40 bg-card p-6"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{name[lang as 'bg' | 'en'] ?? name.bg}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc[lang as 'bg' | 'en'] ?? desc.bg}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* FITNESS & SPA — always */}
        <section>
          <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
            {t('Ризортът', 'The Resort')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold reveal mb-2" style={{ fontFamily: 'var(--font-serif), serif' }}>
            {t('Фитнес & СПА', 'Fitness & SPA')}
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl leading-relaxed reveal" style={{ transitionDelay: '100ms' }}>
            {t(
              'След активен ден — СПА ритуал. Това е signature преживяването тук.',
              'After an active day — a SPA ritual. That’s the signature experience here.'
            )}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FITNESS_FACILITIES.map(({ icon: Icon, name, desc }, i) => (
              <div
                key={i}
                className="reveal activity-card rounded-2xl border border-border/40 bg-card p-6"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-primary/10">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{name[lang as 'bg' | 'en'] ?? name.bg}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc[lang as 'bg' | 'en'] ?? desc.bg}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal" style={{ fontFamily: 'var(--font-serif), serif' }}>
            {t('Готов за Банско?', 'Ready for Bansko?')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed reveal" style={{ transitionDelay: '100ms' }}>
            {t('Бързо потвърждение. Ясни цени. Без изненади.', 'Fast response. Clear pricing. No surprises.')}
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