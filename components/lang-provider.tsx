'use client'

import React, { createContext, useContext, useState } from 'react'

type Lang = 'bg' | 'en'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (bg: string, en: string) => string
}

const LangContext = createContext<LangContextValue>({
  lang: 'bg',
  setLang: () => {},
  t: (bg) => bg,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('bg')

  const t = (bg: string, en: string) => (lang === 'bg' ? bg : en)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
