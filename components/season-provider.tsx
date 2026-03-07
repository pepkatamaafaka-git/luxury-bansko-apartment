'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Season = 'winter' | 'summer'

interface SeasonContextValue {
  season: Season
  setSeason: (s: Season) => void
}

const SeasonContext = createContext<SeasonContextValue>({
  season: 'winter',
  setSeason: () => {},
})

function detectSeason(): Season {
  const month = new Date().getMonth() + 1 // 1–12
  // May–October = summer, rest = winter
  return month >= 5 && month <= 10 ? 'summer' : 'winter'
}

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<Season>('winter')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage first, then auto-detect
    const stored = localStorage.getItem('season') as Season | null
    const detected = stored ?? detectSeason()
    setSeasonState(detected)
    setMounted(true)
  }, [])

  const setSeason = (s: Season) => {
    setSeasonState(s)
    localStorage.setItem('season', s)
  }

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (season === 'summer') {
      root.classList.add('summer')
    } else {
      root.classList.remove('summer')
    }
  }, [season, mounted])

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  return useContext(SeasonContext)
}
