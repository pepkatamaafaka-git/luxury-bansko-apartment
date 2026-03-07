'use client'

import { useEffect, useRef } from 'react'

export function useScrollReveal() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    const observed = new WeakSet<HTMLElement>()

    const showEl = (el: HTMLElement) => {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
      el.style.filter = 'blur(0)'
      el.style.willChange = 'auto'
      el.dataset.revealShown = '1'
    }

    const initEl = (el: HTMLElement) => {
      if (observed.has(el)) return
      observed.add(el)

      if (reduce) {
        showEl(el)
        return
      }

      // Init hidden state ONCE
      if (!el.dataset.revealInit) {
        el.dataset.revealInit = '1'
        el.style.opacity = '0'
        el.style.transform = 'translateY(14px)'
        el.style.filter = 'blur(8px)'
        el.style.transition =
          'opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 700ms cubic-bezier(0.2, 0.8, 0.2, 1)'
        el.style.willChange = 'opacity, transform, filter'
      }

      io.observe(el)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            showEl(el)
            io.unobserve(el)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    const scan = () => {
      root.querySelectorAll<HTMLElement>('.reveal').forEach(initEl)
    }

    // First scan
    scan()

    // Watch for DOM changes (season switch mounts new reveal nodes)
    const mo = new MutationObserver(() => scan())
    mo.observe(root, { childList: true, subtree: true })

    // Safety: force show anything still hidden after a bit
    const safety = window.setTimeout(() => {
      root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
        if (el.dataset.revealShown !== '1') showEl(el)
      })
    }, 1800)

    return () => {
      window.clearTimeout(safety)
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return rootRef
}