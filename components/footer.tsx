'use client'

import Link from 'next/link'
import { useLang } from '@/components/lang-provider'
import { Star } from 'lucide-react'

export function Footer() {
  const { t } = useLang()

  return (
    <footer className="relative border-t border-border/40 mt-24">
      {/* Trust marquee strip */}
      <div className="bg-primary/10 border-y border-primary/20 py-3 overflow-hidden">
        <div className="flex marquee-track select-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-10 px-6 shrink-0">
              <span className="text-xs tracking-widest uppercase text-primary font-semibold whitespace-nowrap">
                {t('5 поредни години — Най-добър 4* Планински СПА хотел в България', '5 Consecutive Years — Best 4★ Mountain SPA Hotel in Bulgaria')}
              </span>
              <span className="text-foreground/30">•</span>
              <span className="text-xs tracking-widest uppercase text-foreground/60 font-medium whitespace-nowrap">
                Booking 9.7 / 10
              </span>
              <span className="text-foreground/30">•</span>
              <span className="text-xs tracking-widest uppercase text-foreground/60 font-medium whitespace-nowrap">
                Google 4.5 / 5
              </span>
              <span className="text-foreground/30">•</span>
              <span className="text-xs tracking-widest uppercase text-foreground/60 font-medium whitespace-nowrap">
                TOP 100 Best Hotels Bulgaria 2025
              </span>
              <span className="text-foreground/30">•</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3
            className="text-2xl font-semibold mb-3"
            style={{ fontFamily: 'var(--font-serif), serif' }}
          >
            Банско
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {t(
              'Двустаен апартамент в СПА Ризорт Св. Иван Рилски — целогодишна почивка в Банско.',
              'Two-room apartment at SPA Resort St. Ivan Rilski — year-round Bansko base.'
            )}
          </p>
          <div className="flex items-center gap-1.5 text-primary">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} fill="currentColor" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">9.7 Booking</span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-4 font-semibold">
            {t('Навигация', 'Navigation')}
          </h4>
          <ul className="space-y-2.5">
            {[
              { href: '/',             bg: 'Начало',           en: 'Home' },
              { href: '/bansko',       bg: 'Банско',           en: 'Bansko' },
              { href: '/resort-spa',   bg: 'Ризорт & СПА',    en: 'Resort & SPA' },
              { href: '/gallery',      bg: 'Галерия',         en: 'Gallery' },
              { href: '/availability', bg: 'Свободни дати',   en: 'Availability' },
              { href: '/contact',      bg: 'Контакт',         en: 'Contact' },
              { href: '/admin',        bg: 'Admin',           en: 'Admin' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t(l.bg, l.en)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-4 font-semibold">
            {t('Контакт', 'Contact')}
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href="https://wa.me/359888000000" className="hover:text-foreground transition-colors">
                WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:info@bansko-apartment.bg" className="hover:text-foreground transition-colors">
                info@bansko-apartment.bg
              </a>
            </li>
            <li className="text-muted-foreground/60">
              {t('Банско, България', 'Bansko, Bulgaria')}
            </li>
          </ul>
        </div>

        {/* Awards */}
        <div>
          <h4 className="text-xs tracking-widest uppercase text-muted-foreground mb-4 font-semibold">
            {t('Награди', 'Awards')}
          </h4>
          <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <li className="border-l-2 border-primary/50 pl-3">
              {t('Най-добър 4* планински СПА хотел в България (БХРА) 2021–2025', 'Best 4★ Mountain SPA Hotel in Bulgaria (BHRA) 2021–2025')}
            </li>
            <li className="border-l-2 border-primary/40 pl-3">
              TOP 100 Best Hotels Bulgaria 2025
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/30 px-6 py-5 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t('Апартамент Банско. Всички права запазени.', 'Bansko Apartment. All rights reserved.')}
        </p>
        <Link href="/legal/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t('Политика за поверителност', 'Privacy Policy')}
        </Link>
      </div>
    </footer>
  )
}
