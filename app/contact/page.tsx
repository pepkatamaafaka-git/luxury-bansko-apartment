'use client'

import { Footer } from '@/components/footer'
import { useLang } from '@/components/lang-provider'
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Mail, MessageCircle, MapPin, Phone, ArrowRight, Check,
  Clock, Instagram, Facebook, Send,
} from 'lucide-react'

const HeroCanvas = dynamic(
  () => import('@/components/hero-canvas').then(m => m.HeroCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-background" /> }
)

export default function ContactPage() {
  const { t, lang } = useLang()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen text-foreground page-enter" style={{ background: 'transparent' }}>
      {/* Shared mountain background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <HeroCanvas />
      </div>

      {/* Hero */
      <section className="relative pt-36 pb-20 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">{t('Свържи се с нас', 'Get in Touch')}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
            {t('Въпроси за апартамента, цени или наличност — отговаряме бързо. Можеш да ни пишеш на WhatsApp, email или чрез формата.',
               'Questions about the apartment, pricing or availability — we respond quickly. Reach us via WhatsApp, email or the form below.')}
          </p>
        </div>
      </section>

      <div className="relative max-w-5xl mx-auto px-6 py-16 pb-28 grid md:grid-cols-5 gap-10" style={{ zIndex: 1 }}>

        {/* ─── Contact info sidebar ─────────────── */}
        <div className="md:col-span-2 space-y-5">
          {/* WhatsApp — primary CTA */}
          <a href="https://wa.me/359888000000" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 glass rounded-2xl p-5 activity-card group">
            <div className="w-12 h-12 rounded-2xl btn-gradient flex items-center justify-center shrink-0">
              <MessageCircle size={22} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{t('WhatsApp — Бърз отговор', 'WhatsApp — Quick Reply')}</p>
              <p className="text-sm text-muted-foreground">+359 888 000 000</p>
              <p className="text-xs text-primary mt-1">{t('Обикновено отговаряме за < 1 час', 'Usually reply within &lt; 1 hour')}</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </a>

          {/* Email */}
          <a href="mailto:info@bansko-apartment.com"
            className="flex items-center gap-4 glass rounded-2xl p-5 activity-card group">
            <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center shrink-0">
              <Mail size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Email</p>
              <p className="text-sm text-muted-foreground">info@bansko-apartment.com</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t('Отговор до 24 часа', 'Reply within 24 hours')}</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </a>

          {/* Phone */}
          <a href="tel:+359888000000"
            className="flex items-center gap-4 glass rounded-2xl p-5 activity-card group">
            <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold">{t('Телефон', 'Phone')}</p>
              <p className="text-sm text-muted-foreground">+359 888 000 000</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t('Пн–Нд, 09:00–21:00', 'Mon–Sun, 09:00–21:00')}</p>
            </div>
          </a>

          {/* Address */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">{t('Местоположение', 'Location')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('Св. Иван Рилски СПА Ризорт', 'St. Ivan Rilski SPA Resort')}
                  <br />Банско, България
                  <br />
                  <span className="text-xs text-muted-foreground/60">{t('~10 мин. от гондолата', '~10 min from gondola')}</span>
                </p>
                <a href="https://maps.google.com/?q=St.+Ivan+Rilski+Bansko" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1">
                  {t('Виж в Google Maps', 'View in Google Maps')} <ArrowRight size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-primary" />
              <p className="font-semibold text-sm">{t('Работно Време', 'Operating Hours')}</p>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>{t('Пн – Пт', 'Mon – Fri')}</span><span>09:00 – 21:00</span></div>
              <div className="flex justify-between"><span>{t('Сб – Нд', 'Sat – Sun')}</span><span>10:00 – 20:00</span></div>
              <div className="flex justify-between text-primary font-medium"><span>WhatsApp</span><span>{t('24/7', '24/7')}</span></div>
            </div>
          </div>

          {/* Social */}
          <div className="glass rounded-2xl p-5">
            <p className="font-semibold text-sm mb-4">{t('Последвай ни', 'Follow Us')}</p>
            <div className="flex gap-3">
              <a href="#" className="flex items-center gap-2 btn-gradient text-xs font-semibold px-4 py-2.5 rounded-full cta-glow">
                <Instagram size={13} /> Instagram
              </a>
              <a href="#" className="flex items-center gap-2 glass text-foreground/70 hover:text-foreground text-xs font-medium px-4 py-2.5 rounded-full transition-all">
                <Facebook size={13} /> Facebook
              </a>
            </div>
          </div>
        </div>

        {/* ─── Contact form ─────────────────────── */}
        <div className="md:col-span-3">
          <div className="glass rounded-2xl p-7">
            {!sent ? (
              <>
                <h2 className="text-2xl font-bold mb-1">{t('Изпрати съобщение', 'Send a Message')}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t('Отговаряме в рамките на 24 часа.', 'We reply within 24 hours.')}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Имена', 'Full Name')} *</label>
                      <input type="text" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        placeholder={t('Вашите имена', 'Your full name')}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                        placeholder="your@email.com"
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Телефон / WhatsApp', 'Phone / WhatsApp')}</label>
                      <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                        placeholder="+359 888 ..."
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Тема', 'Subject')}</label>
                      <select value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground/80">
                        <option value="">{t('Избери тема', 'Select subject')}</option>
                        <option value="availability">{t('Наличност / Дати', 'Availability / Dates')}</option>
                        <option value="pricing">{t('Цени', 'Pricing')}</option>
                        <option value="spa">{t('СПА информация', 'SPA Information')}</option>
                        <option value="group">{t('Групово настаняване', 'Group Stay')}</option>
                        <option value="other">{t('Друго', 'Other')}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 block">{t('Съобщение', 'Message')} *</label>
                    <textarea rows={5} required value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                      placeholder={t('Вашето съобщение, въпрос или заявка...', 'Your message, question or request...')}
                      className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-muted-foreground/50" />
                  </div>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 btn-gradient font-semibold py-4 rounded-full cta-glow text-base">
                    <Send size={16} />
                    {t('Изпрати съобщение', 'Send Message')}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center">{t('или пиши директно на WhatsApp за по-бърз отговор', 'or message us directly on WhatsApp for a faster reply')}</p>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/12 flex items-center justify-center mx-auto mb-5">
                  <Check size={28} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('Съобщението е изпратено!', 'Message Sent!')}</h3>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed text-sm">
                  {t(`Благодарим ти, ${form.name}! Ще отговорим на ${form.email} в рамките на 24 часа.`,
                     `Thank you, ${form.name}! We'll reply to ${form.email} within 24 hours.`)}
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/" className="glass font-medium px-6 py-3 rounded-full hover:bg-secondary transition-all text-sm">{t('Начало', 'Home')}</Link>
                  <Link href="/reserve" className="btn-gradient font-semibold px-6 py-3 rounded-full cta-glow text-sm flex items-center gap-2">
                    {t('Резервирай', 'Reserve')} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
