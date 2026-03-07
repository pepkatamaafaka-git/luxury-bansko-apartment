'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Home as HomeIcon,
  Waves,
  Sparkles,
  Dumbbell,
  Wifi,
  Car,
  Clock,
  Utensils,
  Flame,
  Mountain,
  Tv,
  Baby,
  PhoneCall,
  KeyRound,
  Gamepad2,
  Building2,
  Sun,
  Users,
  MapPin,
  ShieldCheck,
  Info,
} from 'lucide-react'

const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then((m) => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

const images = {
  exterior1:
    'https://www.vagabond.bg/sites/default/files/2023-10/st%20ivan%20rilski%20spa%20hotel%20bansko%202.jpg',
  exterior2:
    'https://www.kayak.com/rimg/himg/25/2a/e4/expediav2-243347-94095a-677971.jpg?crop=true&height=1200&width=1800',
  exterior3:
    'https://www.kayak.com/rimg/himg/59/ee/aa/expedia_group-243347-228136446-311026.jpg?crop=true&height=1200&width=1800',
  spaOutdoor:
    'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%204.jpg',
  spaIndoor:
    'https://www.kayak.com/rimg/himg/eb/d7/06/expedia_group-243347-241526524-293890.jpg?crop=true&height=1200&width=1800',
  spaZone:
    'https://www.kayak.com/rimg/himg/1f/23/10/expedia_group-243347-229143-270552.jpg?crop=true&height=1200&width=1800',
  lobby:
    'https://www.kayak.com/rimg/himg/4b/1b/99/expedia_group-243347-59065685-264917.jpg?crop=true&height=1200&width=1800',
  lounge:
    'https://www.kayak.com/rimg/himg/7f/09/a7/expedia_group-243347-3538380-970495.jpg?crop=true&height=1200&width=1800',
  room:
    'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%203.jpg',
}

type GalleryItem = {
  src: string
  altBg: string
  altEn: string
  tagBg?: string
  tagEn?: string
}

type ShowcaseItem = {
  src: string
  altBg: string
  altEn: string
  tagBg: string
  tagEn: string
  titleBg: string
  titleEn: string
  descBg: string
  descEn: string
}

/* ─────────────────────────────────────────────
   Standard gallery slider
─────────────────────────────────────────────── */
function AutoGallerySlider({
  items,
  intervalMs = 3800,
}: {
  items: GalleryItem[]
  intervalMs?: number
}) {
  const { t, lang } = useLang()
  const [active, setActive] = useState(0)

  const next = () => setActive((a) => (a + 1) % items.length)
  const prev = () => setActive((a) => (a - 1 + items.length) % items.length)

  useEffect(() => {
    const id = window.setInterval(() => next(), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, items.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  const activeItem = items[active]

  return (
    <div className="reveal activity-card rounded-3xl border border-border/40 bg-card overflow-hidden">
      <div className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden">
        <a
          href={activeItem.src}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 block group"
        >
          <img
            key={activeItem.src}
            src={activeItem.src}
            alt={lang === 'bg' ? activeItem.altBg : activeItem.altEn}
            className="w-full h-full object-cover transition-transform duration-[4200ms] ease-out group-hover:scale-[1.035]"
          />
        </a>

        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />

        {(activeItem.tagBg || activeItem.tagEn) && (
          <div className="absolute left-5 bottom-5 glass px-3 py-2 rounded-full text-xs tracking-widest uppercase text-foreground/70">
            {t(activeItem.tagBg ?? '', activeItem.tagEn ?? '')}
          </div>
        )}

        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.preventDefault()
              prev()
            }}
            className="pointer-events-auto w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/60 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.preventDefault()
              next()
            }}
            className="pointer-events-auto w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-secondary/60 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="absolute right-5 bottom-5 glass px-3 py-2 rounded-full text-[11px] text-foreground/70">
          {t('Клик → нов таб', 'Click → new tab')}
        </div>
      </div>

      <div className="p-4 md:p-5 border-t border-border/30">
        <div className="flex gap-2 overflow-x-auto">
          {items.map((it, idx) => {
            const isActive = idx === active
            return (
              <button
                key={it.src + idx}
                type="button"
                onClick={() => setActive(idx)}
                className={[
                  'relative shrink-0 rounded-xl overflow-hidden border transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30',
                  isActive ? 'border-primary shadow-md' : 'border-border/40 hover:border-primary/30',
                ].join(' ')}
                aria-label={`Open image ${idx + 1}`}
              >
                <img
                  src={it.src}
                  alt=""
                  className="w-24 h-16 md:w-28 md:h-[72px] object-cover"
                />
                {isActive && (
                  <div className="absolute inset-0 ring-1 ring-primary/25 bg-primary/5 pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {t('Слайд', 'Slide')} {active + 1} / {items.length}
          </span>
          <span className="hidden sm:inline">{t('Автоматично', 'Automatic')}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   New corporate showcase slider
─────────────────────────────────────────────── */
function CorporateShowcaseSection({
  items,
}: {
  items: ShowcaseItem[]
}) {
  const { t, lang } = useLang()
  const [guestSlide, setGuestSlide] = useState(0)

  const nextGuest = () => setGuestSlide((s) => (s + 1) % items.length)
  const prevGuest = () => setGuestSlide((s) => (s - 1 + items.length) % items.length)

  useEffect(() => {
    const id = window.setInterval(() => nextGuest(), 4300)
    return () => window.clearInterval(id)
  }, [items.length])

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs tracking-[0.22em] uppercase text-primary mb-3 font-semibold">
            {t('Ексклузивни зони', 'Exclusive Areas')}
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-balance reveal"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            {t('Механа • Билярд • Гост зона', 'Tavern • Billiards • Guest Lounge')}
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mt-4 leading-relaxed reveal"
            style={{ transitionDelay: '100ms' }}
          >
            {t(
              'Общи пространства в комплекса за вечери, разговори, игри и спокойни моменти след СПА или след ден в планината.',
              'Shared spaces inside the resort for dinners, conversations, games and calm evenings after SPA or after a day in the mountains.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 reveal" style={{ transitionDelay: '160ms' }}>
          <button
            type="button"
            onClick={prevGuest}
            className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextGuest}
            className="w-11 h-11 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        className="reveal grid xl:grid-cols-[1.35fr_0.65fr] gap-5"
        style={{ transitionDelay: '220ms' }}
      >
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-sm">
          <a
            href={items[guestSlide].src}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative h-[520px] md:h-[620px] overflow-hidden">
              <img
                key={items[guestSlide].src}
                src={items[guestSlide].src}
                alt={lang === 'bg' ? items[guestSlide].altBg : items[guestSlide].altEn}
                className="w-full h-full object-cover transition-transform duration-[4500ms] ease-out group-hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none" />

              <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                <span className="glass px-3 py-2 rounded-full text-[11px] tracking-widest uppercase text-foreground/80 border border-white/10">
                  {t('Общи части', 'Shared Spaces')}
                </span>
                <span className="glass px-3 py-2 rounded-full text-[11px] tracking-widest uppercase text-foreground/80 border border-white/10">
                  {guestSlide + 1} / {items.length}
                </span>
              </div>

              <div className="absolute left-0 right-0 bottom-0 p-6 md:p-8">
                <div className="max-w-xl">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-primary mb-2 font-semibold">
                    {lang === 'bg' ? items[guestSlide].tagBg : items[guestSlide].tagEn}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {lang === 'bg' ? items[guestSlide].titleBg : items[guestSlide].titleEn}
                  </h3>
                  <p className="text-white/75 text-sm md:text-base leading-relaxed">
                    {lang === 'bg' ? items[guestSlide].descBg : items[guestSlide].descEn}
                  </p>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-4">
            {items.map((item, i) => {
              const isActive = i === guestSlide
              return (
                <button
                  key={item.src + i}
                  type="button"
                  onClick={() => setGuestSlide(i)}
                  className={`group text-left overflow-hidden rounded-[22px] border transition-all duration-300 ${
                    isActive
                      ? 'border-primary/40 bg-white/10 shadow-lg'
                      : 'border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4 p-3">
                    <div className="relative w-24 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={item.src}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 ring-1 ring-white/10" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-primary font-semibold mb-1">
                        {lang === 'bg' ? item.tagBg : item.tagEn}
                      </p>
                      <h4 className="font-semibold text-sm leading-tight mb-1 truncate">
                        {lang === 'bg' ? item.titleBg : item.titleEn}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {lang === 'bg' ? item.descBg : item.descEn}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/5 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {t('Навигация', 'Navigation')}
              </span>
              <a
                href={items[guestSlide].src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {t('Отвори голяма снимка', 'Open full image')}
              </a>
            </div>

            <div className="flex gap-2 mb-5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGuestSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === guestSlide ? 'bg-primary flex-1' : 'bg-white/10 w-8 hover:bg-white/20'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-background/30 px-4 py-3">
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                  {t('Подходящо за', 'Best for')}
                </p>
                <p className="font-medium">
                  {t('Вечери и събирания', 'Evenings & gatherings')}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-background/30 px-4 py-3">
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-1">
                  {t('Атмосфера', 'Atmosphere')}
                </p>
                <p className="font-medium">
                  {t('Топла и уютна', 'Warm & cosy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Aligned list rows
─────────────────────────────────────────────── */
function CheckRow({
  icon: Icon,
  titleBg,
  titleEn,
  badgeBg,
  badgeEn,
}: {
  icon: any
  titleBg: string
  titleEn: string
  badgeBg?: string
  badgeEn?: string
}) {
  const { t, lang } = useLang()

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-background/50 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-primary" />
      </div>

      <div className="min-w-0 flex-1 flex items-center">
        <p className="text-sm font-semibold leading-tight">{t(titleBg, titleEn)}</p>
        {(badgeBg || badgeEn) && (
          <span className="ml-2 text-[10px] tracking-widest uppercase px-2 py-1 rounded-full border border-border/40 bg-card text-muted-foreground whitespace-nowrap">
            {lang === 'bg' ? badgeBg : badgeEn}
          </span>
        )}
      </div>

      <div className="shrink-0">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={14} className="text-primary" />
        </div>
      </div>
    </div>
  )
}

export default function ApartmentPage() {
  const { t, lang } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()

  const apartmentGallery: GalleryItem[] = useMemo(
    () => [
      { src: images.room, altBg: 'Спалня', altEn: 'Bedroom', tagBg: 'Спалня', tagEn: 'Bedroom' },
      { src: images.lounge, altBg: 'Дневна', altEn: 'Living room', tagBg: 'Дневна', tagEn: 'Living room' },
      { src: images.lobby, altBg: 'Кухня', altEn: 'Kitchen', tagBg: 'Кухня', tagEn: 'Kitchen' },
      { src: images.exterior2, altBg: 'Тераса', altEn: 'Balcony', tagBg: 'Тераса', tagEn: 'Balcony' },
      { src: images.exterior3, altBg: 'Гледка / атмосфера', altEn: 'View / atmosphere', tagBg: 'Атмосфера', tagEn: 'Atmosphere' },
    ],
    []
  )

const [apartmentHeroSlide, setApartmentHeroSlide] = useState(0)
const nextApartmentHero = () => setApartmentHeroSlide((s) => (s + 1) % apartmentGallery.length)
const prevApartmentHero = () => setApartmentHeroSlide((s) => (s - 1 + apartmentGallery.length) % apartmentGallery.length)
  const guestAreaImages: ShowcaseItem[] = useMemo(
    () => [
      {
        src: images.lounge,
        tagBg: 'Механа',
        tagEn: 'Tavern',
        titleBg: 'Обща механа за гости',
        titleEn: 'Shared guest tavern',
        descBg: 'Пространство за вечери, събирания и уютни разговори след активен ден.',
        descEn: 'A cosy space for dinners, gatherings and calm conversations after an active day.',
        altBg: 'Обща механа за гости',
        altEn: 'Shared guest tavern',
      },
      {
        src: images.lobby,
        tagBg: 'Гост зона',
        tagEn: 'Guest Lounge',
        titleBg: 'Лоби и общи части',
        titleEn: 'Lobby & shared lounge',
        descBg: 'Елегантна обща зона за почивка, срещи и приятно време с компания.',
        descEn: 'An elegant shared area for relaxing, meeting and spending quality time together.',
        altBg: 'Лоби и общи части',
        altEn: 'Lobby and shared areas',
      },
      {
        src: images.spaZone,
        tagBg: 'Игри',
        tagEn: 'Games',
        titleBg: 'Билярд и забавления',
        titleEn: 'Billiards & games',
        descBg: 'Идеално място за забавление вечер — след СПА или след ден в планината.',
        descEn: 'A perfect evening entertainment spot — after SPA or after a day in the mountains.',
        altBg: 'Билярд и игри',
        altEn: 'Billiards and games',
      },
      {
        src: images.exterior1,
        tagBg: 'Комплекс',
        tagEn: 'Resort',
        titleBg: 'Атмосфера в комплекса',
        titleEn: 'Resort atmosphere',
        descBg: 'Спокойствие, планинска среда и премиум усещане през цялата година.',
        descEn: 'Calm, mountain surroundings and a premium feeling all year round.',
        altBg: 'Комплексът',
        altEn: 'The resort',
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">
      <Navbar />

      <section className="relative h-[86vh] min-h-[620px] flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        <div className="absolute inset-0 hero-overlay-bottom pointer-events-none" />
        <div className="absolute inset-0 hero-overlay-side pointer-events-none" />

        <div className="relative z-10 px-6 max-w-5xl mx-auto w-full">
          <div className="mb-4 inline-flex items-center gap-2 glass text-xs tracking-widest uppercase px-4 py-2 rounded-full text-foreground/70">
            <HomeIcon size={12} className="text-primary" />
            {t('Апартаментът • Св. Иван Рилски', 'The Apartment • St. Ivan Rilski')}
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance leading-none text-foreground drop-shadow-sm">
            {t('Твоят апартамент.', 'Your apartment.')}
            <br />
            <span className="text-primary italic">
              {season === 'winter' ? t('Зима в комфорт.', 'Winter in comfort.') : t('Лято в Пирин.', 'Summer in Pirin.')}
            </span>
          </h1>

          <p className="text-base md:text-lg text-foreground/75 mb-10 max-w-2xl leading-relaxed">
            {t(
              'Двустаен апартамент до 6 гости — кухня, отделна спалня и дневна, тераса с планинска гледка + СПА, фитнес и рецепция 24/7.',
              'Two-room apartment for up to 6 guests — kitchen, separate bedroom & living room, balcony with mountain views + SPA, gym and 24/7 reception.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/availability"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-full cta-glow hover:opacity-90 transition-all text-base shadow-lg"
            >
              {t('Провери свободни дати', 'Check Availability')} <ArrowRight size={16} />
            </Link>
            <Link
              href="/resort-spa"
              className="inline-flex items-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-8 py-4 rounded-full transition-all text-base"
            >
              {t('Разгледай СПА', 'Explore SPA')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div ref={revealRef} className="max-w-7xl mx-auto px-6 mt-20 space-y-28 pb-10">


<section className="relative">
  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
    <div>
      <p className="text-xs tracking-[0.22em] uppercase text-primary mb-3 font-semibold">
        {t('Апартаментът', 'The Apartment')}
      </p>
      <h2
        className="text-4xl md:text-5xl font-bold text-balance reveal"
        style={{ fontFamily: 'var(--font-serif), serif' }}
      >
        {t('Снимки на апартамента', 'Apartment Gallery')}
      </h2>
      <p
        className="text-muted-foreground max-w-2xl mt-4 leading-relaxed reveal"
        style={{ transitionDelay: '100ms' }}
      >
        {t(
          'Голям слайдър с чист, модерен дизайн и плавна смяна на снимките.',
          'A large slider with a clean, modern design and smooth image transitions.'
        )}
      </p>
    </div>
  </div>

  <div
    className="reveal relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-sm"
    style={{ transitionDelay: '180ms' }}
  >
    <div className="relative h-[560px] md:h-[700px] overflow-hidden">
      <img
        key={apartmentGallery[apartmentHeroSlide].src}
        src={apartmentGallery[apartmentHeroSlide].src}
        alt={lang === 'bg' ? apartmentGallery[apartmentHeroSlide].altBg : apartmentGallery[apartmentHeroSlide].altEn}
        className="w-full h-full object-cover transition-transform duration-[5000ms] ease-out scale-[1.02] hover:scale-[1.045]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none" />

      {/* left arrow */}
      <button
        type="button"
        onClick={prevApartmentHero}
        aria-label="Previous"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 group"
      >
        <span className="flex items-center justify-center w-12 md:w-14 h-28 md:h-36 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.10] group-hover:border-white/20">
          <ChevronLeft size={22} className="text-white/70 group-hover:text-white/95 transition-colors" />
        </span>
      </button>

      {/* right arrow */}
      <button
        type="button"
        onClick={nextApartmentHero}
        aria-label="Next"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 group"
      >
        <span className="flex items-center justify-center w-12 md:w-14 h-28 md:h-36 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.10] group-hover:border-white/20">
          <ChevronRight size={22} className="text-white/70 group-hover:text-white/95 transition-colors" />
        </span>
      </button>

      {/* top info */}
      <div className="absolute top-6 left-6 flex flex-wrap gap-2">
        <span className="glass px-3 py-2 rounded-full text-[11px] tracking-widest uppercase text-foreground/80 border border-white/10">
          {t('Апартамент', 'Apartment')}
        </span>
        <span className="glass px-3 py-2 rounded-full text-[11px] tracking-widest uppercase text-foreground/80 border border-white/10">
          {apartmentHeroSlide + 1} / {apartmentGallery.length}
        </span>
      </div>

      {/* bottom text */}
      <div className="absolute left-0 right-0 bottom-0 p-6 md:p-10">
        <div className="max-w-2xl">
          <p className="text-[11px] tracking-[0.22em] uppercase text-primary mb-2 font-semibold">
            {lang === 'bg'
              ? apartmentGallery[apartmentHeroSlide].tagBg
              : apartmentGallery[apartmentHeroSlide].tagEn}
          </p>

          <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
            {lang === 'bg'
              ? apartmentGallery[apartmentHeroSlide].altBg
              : apartmentGallery[apartmentHeroSlide].altEn}
          </h3>

          <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl">
            {t(
              'Светлина, уют, пространство и атмосфера за истинска планинска почивка.',
              'Light, comfort, space and atmosphere for a true mountain stay.'
            )}
          </p>
        </div>
      </div>
    </div>

    {/* dots */}
    <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10">
      {apartmentGallery.map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setApartmentHeroSlide(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === apartmentHeroSlide
              ? 'bg-primary w-12'
              : 'bg-white/20 hover:bg-white/35 w-6'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  </div>
</section>

        <CorporateShowcaseSection items={guestAreaImages} />

        <section className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="reveal activity-card rounded-3xl border border-border/40 bg-card p-8 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-primary font-semibold">
                  {t('Включено', 'Included')}
                </p>
                <h3 className="text-2xl font-bold">{t('Услуги на ризорта', 'Resort services')}</h3>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <CheckRow icon={Waves} titleBg="Неограничен достъп до цялата СПА зона" titleEn="Unlimited access to the full SPA area" />
              <CheckRow icon={Waves} titleBg="Отопляем вътрешен минерален басейн 36°C" titleEn="Heated indoor mineral pool 36°C" />
              <CheckRow icon={Sparkles} titleBg="Финландска сауна, хамам и парна баня" titleEn="Finnish sauna, hammam and steam room" />
              <CheckRow icon={Dumbbell} titleBg="Модерен фитнес — свободен достъп" titleEn="Modern gym — free access" />
              <CheckRow icon={Wifi} titleBg="Безплатен Wi-Fi в целия ризорт" titleEn="Free Wi-Fi throughout the resort" />
              <CheckRow icon={Car} titleBg="Паркинг (при наличност)" titleEn="Parking (subject to availability)" badgeBg="при наличност" badgeEn="subject to availability" />
              <CheckRow icon={Clock} titleBg="Денонощна рецепция" titleEn="24/7 reception" />
              <CheckRow icon={Check} titleBg="Крайно почистване" titleEn="Final cleaning" />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/resort-spa"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-md"
              >
                {t('СПА детайли', 'SPA details')} <ArrowRight size={14} />
              </Link>
              <Link
                href="/availability"
                className="inline-flex items-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-6 py-3 rounded-full transition-all text-sm"
              >
                {t('Провери дати', 'Check dates')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div
            className="reveal activity-card rounded-3xl border border-border/40 bg-card p-8 h-full flex flex-col"
            style={{ transitionDelay: '80ms' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <HomeIcon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-primary font-semibold">
                  {t('Апартаментът', 'The apartment')}
                </p>
                <h3 className="text-2xl font-bold">{t('Удобства', 'Amenities')}</h3>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              <CheckRow icon={Users} titleBg="Двустаен апартамент — до 6 гости" titleEn="Two-room apartment — up to 6 guests" />
              <CheckRow icon={Utensils} titleBg="Напълно оборудвана кухня" titleEn="Fully equipped kitchen" />
              <CheckRow icon={HomeIcon} titleBg="Дневна и отделна спалня" titleEn="Living room + separate bedroom" />
              <CheckRow icon={Flame} titleBg="Хол с камина (зимен сезон)" titleEn="Living room with fireplace (winter season)" badgeBg="зима" badgeEn="winter" />
              <CheckRow icon={Mountain} titleBg="Тераса с планинска гледка" titleEn="Balcony with mountain view" />
              <CheckRow icon={Tv} titleBg="Smart TV с кабелна телевизия" titleEn="Smart TV with cable channels" />
              <CheckRow icon={Baby} titleBg="Бебешко креватче (при заявка)" titleEn="Baby cot (on request)" badgeBg="при заявка" badgeEn="on request" />
              <CheckRow icon={PhoneCall} titleBg="Собствен телефон към рецепция 24/7" titleEn="Direct in-apartment phone to reception 24/7" />
              <CheckRow icon={KeyRound} titleBg="Подземен паркинг с чип" titleEn="Underground parking with chip" />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/reserve"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full cta-glow hover:opacity-90 transition-all text-sm shadow-md"
              >
                {t('Резервирай директно', 'Reserve directly')} <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-6 py-3 rounded-full transition-all text-sm"
              >
                {t('Въпроси', 'Questions')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              aBg: 'Обща механа за гости',
              aEn: 'Shared guest tavern',
              bBg: 'За вечери и събирания',
              bEn: 'For dinners & gatherings',
            },
            {
              icon: Gamepad2,
              aBg: 'Билярд & игри',
              aEn: 'Billiards & games',
              bBg: 'След СПА или планината',
              bEn: 'After SPA or hiking',
            },
            {
              icon: Sun,
              aBg: 'Сауна/СПА за блока',
              aEn: 'Building sauna / SPA',
              bBg: 'Звъниш → загряват',
              bEn: 'Call → pre-heated',
            },
          ].map((c, i) => (
            <div
              key={i}
              className="reveal activity-card rounded-3xl border border-border/40 bg-card p-7"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <c.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(c.aBg, c.aEn)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(c.bBg, c.bEn)}</p>
            </div>
          ))}
        </section>

        <section className="text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm tracking-wide">
              {t('Банско, България — ~10 мин. от гондолата', 'Bansko, Bulgaria — ~10 min from the gondola')}
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 reveal"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            {t('Готов за резервация?', 'Ready to book?')}
          </h2>
          <p
            className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed reveal"
            style={{ transitionDelay: '100ms' }}
          >
            {t('Бързо потвърждение. Ясни цени. Без изненади.', 'Fast response. Clear pricing. No surprises.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal" style={{ transitionDelay: '200ms' }}>
            <Link
              href="/availability"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-10 py-4 rounded-full cta-glow hover:opacity-90 transition-all shadow-lg"
            >
              {t('Провери свободни дати', 'Check Availability')} <ArrowRight size={16} />
            </Link>
            <Link
              href="/reserve"
              className="inline-flex items-center justify-center gap-2 glass text-foreground/80 hover:text-foreground font-medium px-10 py-4 rounded-full transition-all"
            >
              {t('Резервирай директно', 'Reserve directly')} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}