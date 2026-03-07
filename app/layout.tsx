import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { SeasonProvider } from '@/components/season-provider'
import { LangProvider } from '@/components/lang-provider'

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Playfair Display loaded via @next/font not available, use CDN approach via CSS variable
export const metadata: Metadata = {
  title: 'Апартамент в Банско | Св. Иван Рилски СПА Ризорт',
  description:
    'Двустаен апартамент в най-добрия 4-звезден планински СПА хотел в България. Ски, SPA, летни преходи — целогодишно в Банско.',
  keywords: ['Банско', 'апартамент', 'СПА', 'ски', 'планинска почивка', 'Св. Иван Рилски'],
  openGraph: {
    title: 'Апартамент в Банско | Св. Иван Рилски СПА Ризорт',
    description: 'Двустаен апартамент в топ планински СПА ризорт — 9.7/10 на Booking.',
    locale: 'bg_BG',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <head />
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}>
        <LangProvider>
          <SeasonProvider>
            {children}
          </SeasonProvider>
        </LangProvider>
        <Analytics />
      </body>
    </html>
  )
}
