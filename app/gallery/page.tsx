'use client'

import { useState } from 'react'
import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useSeason } from '@/components/season-provider'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { X } from 'lucide-react'

const categories = {
  all: { bg: 'Всички', en: 'All' },
  exterior: { bg: 'Екстериор', en: 'Exterior' },
  spa: { bg: 'СПА & Басейни', en: 'SPA & Pools' },
  interior: { bg: 'Интериор', en: 'Interior' },
}

const galleryItems = [
  {
    src: 'https://www.vagabond.bg/sites/default/files/2023-10/st%20ivan%20rilski%20spa%20hotel%20bansko%202.jpg',
    cat: 'exterior',
    season: 'winter',
    altBg: 'Екстериор на ризорта — зима',
    altEn: 'Resort exterior — winter',
    span: 'wide',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/25/2a/e4/expediav2-243347-94095a-677971.jpg?crop=true&height=1200&width=1800',
    cat: 'exterior',
    season: 'both',
    altBg: 'Сграда на ризорта — предна гледка',
    altEn: 'Resort building front view',
    span: 'normal',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/59/ee/aa/expedia_group-243347-228136446-311026.jpg?crop=true&height=1200&width=1800',
    cat: 'exterior',
    season: 'both',
    altBg: 'Сграда на ризорта — страничен ъгъл',
    altEn: 'Resort building side angle',
    span: 'normal',
  },
  {
    src: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%204.jpg',
    cat: 'spa',
    season: 'both',
    altBg: 'Външен отопляем басейн и СПА зона',
    altEn: 'Outdoor heated pool and SPA zone',
    span: 'wide',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/eb/d7/06/expedia_group-243347-241526524-293890.jpg?crop=true&height=1200&width=1800',
    cat: 'spa',
    season: 'both',
    altBg: 'Вътрешен СПА басейн с джакузи',
    altEn: 'Indoor SPA pool with jacuzzi',
    span: 'tall',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/1f/23/10/expedia_group-243347-229143-270552.jpg?crop=true&height=1200&width=1800',
    cat: 'spa',
    season: 'both',
    altBg: 'СПА зона за релакс с шезлонги',
    altEn: 'SPA relaxation zone with loungers',
    span: 'normal',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/4b/1b/99/expedia_group-243347-59065685-264917.jpg?crop=true&height=1200&width=1800',
    cat: 'interior',
    season: 'both',
    altBg: 'Лоби с камина — луксозна атмосфера',
    altEn: 'Lobby with fireplace — luxury atmosphere',
    span: 'wide',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/7f/09/a7/expedia_group-243347-3538380-970495.jpg?crop=true&height=1200&width=1800',
    cat: 'interior',
    season: 'both',
    altBg: 'Топъл лаунж интериор',
    altEn: 'Warm lounge interior',
    span: 'normal',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/ad/04/c7/expedia_group-243347-58946781-029213.jpg?crop=true&height=1200&width=1800',
    cat: 'interior',
    season: 'both',
    altBg: 'Лоби — друг ъгъл',
    altEn: 'Lobby alternative angle',
    span: 'normal',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/26/91/80/expedia_group-243347-200117792-253570.jpg?crop=true&height=1200&width=1800',
    cat: 'interior',
    season: 'both',
    altBg: 'Апартамент — дневна стая',
    altEn: 'Apartment living room',
    span: 'wide',
  },
  {
    src: 'https://www.kayak.com/rimg/himg/1d/71/bd/expedia_group-243347-267315192-299597.jpg?crop=true&height=1200&width=1800',
    cat: 'interior',
    season: 'both',
    altBg: 'Ресторант — изложба на храна',
    altEn: 'Restaurant food display',
    span: 'normal',
  },
  {
    src: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko%203.jpg',
    cat: 'interior',
    season: 'both',
    altBg: 'Стая с поднос за закуска',
    altEn: 'Room lifestyle breakfast tray',
    span: 'normal',
  },
  {
    src: 'https://www.vagabond.bg/sites/default/files/issues/205/st%20ivan%20rilski%20resort%20enjoy%20bansko%20year%20round/st%20ivan%20rilski%20spa%20hotel%20bansko.jpg',
    cat: 'interior',
    season: 'both',
    altBg: 'Лаунж — редакционен',
    altEn: 'Lounge editorial',
    span: 'normal',
  },
]

function LightboxModal({
  item,
  onClose,
}: {
  item: typeof galleryItems[0]
  onClose: () => void
}) {
  const { t } = useLang()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 glass p-3 rounded-full text-foreground/70 hover:text-foreground transition-colors"
        aria-label={t('Затвори', 'Close')}
      >
        <X size={20} />
      </button>
      <div
        className="max-w-5xl w-full mx-6 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={t(item.altBg, item.altEn)}
          className="w-full max-h-[80vh] object-contain bg-card"
        />
        <div className="bg-card px-6 py-4">
          <p className="text-sm text-muted-foreground">{t(item.altBg, item.altEn)}</p>
        </div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const { t } = useLang()
  const { season } = useSeason()
  const revealRef = useScrollReveal()
  const [activeCategory, setActiveCategory] = useState<keyof typeof categories>('all')
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null)

  const filtered = galleryItems.filter((item) => {
    const catMatch = activeCategory === 'all' || item.cat === activeCategory
    return catMatch
  })

  return (
    <div className="min-h-screen bg-background text-foreground page-enter">

      {/* Header */}
      <section className="pt-36 pb-16 px-6 max-w-7xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
          {t('Визуален тур', 'Visual Tour')}
        </p>
        <h1
          className="text-5xl md:text-7xl font-bold mb-4 text-balance"
          style={{ fontFamily: 'var(--font-playfair), serif' }}
        >
          {t('Галерия', 'Gallery')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          {t(
            'СПА Ризорт Св. Иван Рилски — екстериор, СПА зони и интериор.',
            'SPA Resort St. Ivan Rilski — exterior, SPA zones, and interiors.'
          )}
        </p>

        {/* Season label */}
        <div className="mt-4 inline-flex items-center gap-2 glass text-xs tracking-widest uppercase px-4 py-2 rounded-full text-foreground/60">
          {season === 'winter'
            ? t('Зимен изглед активен', 'Winter view active')
            : t('Летен изглед активен', 'Summer view active')}
        </div>
      </section>

      {/* Category filters */}
      <div className="px-6 max-w-7xl mx-auto mb-10">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`text-sm px-5 py-2.5 rounded-full transition-all border ${
                activeCategory === key
                  ? 'bg-accent text-primary-foreground border-accent font-semibold'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {t(categories[key].bg, categories[key].en)}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      <div ref={revealRef} className="px-6 max-w-7xl mx-auto pb-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="reveal break-inside-avoid cursor-pointer group overflow-hidden rounded-xl border border-border/30"
              style={{ transitionDelay: `${(i % 6) * 60}ms` }}
              onClick={() => setLightbox(item)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.src}
                  alt={t(item.altBg, item.altEn)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4">
                  <p className="text-xs text-foreground/80 font-medium">
                    {t(item.altBg, item.altEn)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            {t('Няма снимки в тази категория.', 'No photos in this category.')}
          </div>
        )}

        {/* Apartment coming soon */}
        <div className="mt-16 glass rounded-2xl p-10 text-center border border-border/40">
          <p className="text-xs tracking-widest uppercase text-primary mb-3 font-semibold">
            {t('Скоро', 'Coming soon')}
          </p>
          <h3
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            {t('Снимки на апартамента', 'Apartment Photos')}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {t(
              'Собственикът скоро ще добави лични снимки на апартамента. Засега — атмосферата на ризорта.',
              "The owner's personal apartment photos are coming soon. For now — the full resort atmosphere."
            )}
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <LightboxModal item={lightbox} onClose={() => setLightbox(null)} />
      )}

      <Footer />
    </div>
  )
}
