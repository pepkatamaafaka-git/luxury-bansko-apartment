'use client'

import { useEffect, useRef } from 'react'

interface MapMarker {
  lat: number
  lng: number
  label: string
  type: 'hotel' | 'gondola' | 'trail' | 'bar' | 'attraction'
}

const MARKER_COLORS: Record<MapMarker['type'], string> = {
  hotel:      '#2563eb',
  gondola:    '#7c3aed',
  trail:      '#16a34a',
  bar:        '#d97706',
  attraction: '#dc2626',
}

const BANSKO_MARKERS: MapMarker[] = [
  { lat: 41.8373, lng: 23.4881, label: 'СПА Ризорт Св. Иван Рилски', type: 'hotel' },
  { lat: 41.8322, lng: 23.4914, label: 'Гондола Банско', type: 'gondola' },
  { lat: 41.8351, lng: 23.4851, label: 'Стар Банско (пешеходна зона)', type: 'attraction' },
  { lat: 41.8298, lng: 23.4897, label: 'Happy End Bar (апре-ски)', type: 'bar' },
  { lat: 41.8310, lng: 23.4870, label: 'Kasapinova Kashta (механа)', type: 'bar' },
  { lat: 41.8290, lng: 23.4920, label: 'Начало на пътека Бъндерица', type: 'trail' },
  { lat: 41.8400, lng: 23.4800, label: 'Църква Света Троица', type: 'attraction' },
]

interface BanskoMapProps {
  tab: 'winter' | 'summer'
  lang: 'bg' | 'en'
}

export function BanskoMap({ tab, lang }: BanskoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [41.8351, 23.4881],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add markers
      BANSKO_MARKERS.forEach(marker => {
        const color = MARKER_COLORS[marker.type]

        const svgIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid white;
            transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          "><div style="transform:rotate(45deg);color:white;font-size:13px;font-weight:bold;width:100%;text-align:center;line-height:28px;">${
            marker.type === 'hotel' ? '★' :
            marker.type === 'gondola' ? '⬆' :
            marker.type === 'trail' ? '⛰' :
            marker.type === 'bar' ? '♪' : '◉'
          }</div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        })

        const popupContent = `
          <div style="font-family:system-ui,sans-serif;min-width:160px;">
            <div style="font-size:11px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">
              ${marker.type === 'hotel' ? (lang==='bg'?'Апартамент':'Apartment') :
                marker.type === 'gondola' ? (lang==='bg'?'Гондола':'Gondola') :
                marker.type === 'trail' ? (lang==='bg'?'Пътека':'Trail') :
                marker.type === 'bar' ? (lang==='bg'?'Бар / Механа':'Bar / Mehana') :
                (lang==='bg'?'Забележителност':'Attraction')}
            </div>
            <div style="font-size:13px;font-weight:600;color:#111;">${marker.label}</div>
          </div>
        `
        L.marker([marker.lat, marker.lng], { icon: svgIcon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 220 })
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [lang])

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden border border-border/40 shadow-lg"
        style={{ height: 420 }}
        aria-label={lang === 'bg' ? 'Карта на Банско' : 'Map of Bansko'}
      />
      {/* Map legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(Object.entries(MARKER_COLORS) as [MapMarker['type'], string][]).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {type === 'hotel'      ? (lang==='bg'?'Апартамент':'Apartment')  :
             type === 'gondola'    ? (lang==='bg'?'Гондола':'Gondola')        :
             type === 'trail'      ? (lang==='bg'?'Пътека':'Trail')           :
             type === 'bar'        ? (lang==='bg'?'Бар / Механа':'Bar/Mehana'):
                                     (lang==='bg'?'Забележителност':'Attraction')}
          </span>
        ))}
      </div>
    </>
  )
}
