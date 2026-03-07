'use client'

import { useRef, useEffect } from 'react'
import { useSeason } from '@/components/season-provider'

// ─── CSS-animated 2D mountain silhouettes + gradient sky ──────────────────────

function WinterBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(170deg, #e8f4fd 0%, #cce3f5 25%, #b0d4ed 55%, #ddeeff 80%, #f0f8ff 100%)',
        }}
      />

      <div
        className="absolute inset-x-0"
        style={{
          top: '10%',
          height: '35%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(180,215,240,0.35) 40%, rgba(200,230,250,0.2) 70%, transparent 100%)',
          filter: 'blur(18px)',
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          top: '30%',
          height: '20%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(210,235,255,0.25) 50%, transparent 100%)',
          filter: 'blur(24px)',
        }}
      />

      <div
        className="absolute"
        style={{
          top: '-10%',
          right: '12%',
          width: '440px',
          height: '440px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,248,230,0.75) 0%, rgba(220,238,255,0.35) 45%, transparent 75%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Far mountains */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.45 }}
      >
        <path
          d="M0,420 L0,280 L80,220 L160,260 L240,170 L340,100 L420,150 L500,90 L580,130 L660,60 L740,110 L820,50 L900,100 L980,140 L1060,80 L1140,130 L1220,90 L1310,160 L1380,200 L1440,170 L1440,420 Z"
          fill="rgba(190,220,245,0.5)"
        />
        <path
          d="M660,60 L680,90 L700,70 L720,95 L740,110 L720,100 L700,80 L680,100 L660,60Z"
          fill="rgba(240,250,255,0.9)"
        />
        <path
          d="M820,50 L840,80 L860,62 L875,85 L900,100 L875,90 L855,72 L838,88 L820,50Z"
          fill="rgba(240,250,255,0.9)"
        />
        <path
          d="M500,90 L516,118 L530,100 L545,120 L560,108 L542,112 L528,105 L514,122 L500,90Z"
          fill="rgba(240,250,255,0.85)"
        />
      </svg>

      {/* Mid mountains */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 380"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.62 }}
      >
        <path
          d="M0,380 L0,310 L100,240 L180,280 L280,180 L380,240 L460,160 L560,200 L640,110 L720,160 L800,90 L880,145 L960,105 L1040,165 L1120,120 L1200,170 L1300,220 L1380,260 L1440,240 L1440,380 Z"
          fill="rgba(170,210,238,0.6)"
        />
        <path
          d="M640,110 L662,145 L680,125 L698,148 L720,160 L696,150 L676,130 L658,150 L640,110Z"
          fill="rgba(245,252,255,0.95)"
        />
        <path
          d="M800,90 L822,128 L840,108 L858,130 L878,145 L856,136 L836,114 L820,132 L800,90Z"
          fill="rgba(245,252,255,0.95)"
        />
      </svg>

      {/* Front mountains */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 340"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.86 }}
      >
        <defs>
          <linearGradient id="frontMtnWinter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(140,188,225,0.85)" />
            <stop offset="100%" stopColor="rgba(155,200,235,0.7)" />
          </linearGradient>
        </defs>
        <path
          d="M0,340 L0,290 L-40,340 M0,290 L100,210 L200,260 L300,180 L400,230 L500,150 L600,190 L700,120 L780,170 L860,130 L940,170 L1020,120 L1100,175 L1180,140 L1260,200 L1340,250 L1440,220 L1440,340 Z"
          fill="url(#frontMtnWinter)"
        />
        <path
          d="M700,120 L724,162 L745,140 L764,165 L780,170 L760,160 L742,145 L720,167 L700,120Z"
          fill="rgba(248,254,255,1)"
        />
        <path
          d="M860,130 L882,166 L900,148 L918,168 L938,170 L916,162 L896,152 L878,168 L860,130Z"
          fill="rgba(248,254,255,1)"
        />
        <path
          d="M500,150 L520,184 L536,166 L552,186 L568,190 L550,182 L532,170 L516,186 L500,150Z"
          fill="rgba(248,254,255,1)"
        />
        <path
          d="M1020,120 L1042,158 L1060,138 L1078,160 L1096,165 L1075,156 L1057,142 L1040,160 L1020,120Z"
          fill="rgba(248,254,255,1)"
        />
      </svg>

      <div
        className="absolute bottom-0 inset-x-0"
        style={{
          height: '18%',
          background:
            'linear-gradient(180deg, rgba(225,242,255,0.0) 0%, rgba(235,248,255,0.6) 40%, rgba(248,254,255,0.95) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          bottom: '14%',
          height: '22%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(235,248,255,0.28) 50%, transparent 100%)',
          filter: 'blur(12px)',
        }}
      />
    </div>
  )
}

function SummerBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Golden-hour sky (NO blue) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(170deg, #FFE7C7 0%, #FFD4AE 18%, #FFC28F 38%, #FFB07B 55%, #F7C7A3 72%, #F6E1C2 86%, #FFF2DE 100%)',
        }}
      />

      {/* Sun glow (warm) */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          right: '14%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,220,140,0.70) 0%, rgba(255,170,90,0.22) 42%, transparent 72%)',
          filter: 'blur(6px)',
        }}
      />

      {/* Light rays */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: '65%',
          height: '60%',
          background:
            'conic-gradient(from 210deg at 80% 0%, transparent 0deg, rgba(255,210,150,0.14) 10deg, transparent 22deg, rgba(255,210,150,0.09) 30deg, transparent 44deg)',
          filter: 'blur(0.2px)',
        }}
      />

      {/* Warm horizon haze */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '52%',
          height: '22%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,210,160,0.26) 45%, rgba(255,240,220,0.12) 70%, transparent 100%)',
          filter: 'blur(22px)',
        }}
      />

      {/* Far mountains — warm dusty haze */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.38 }}
      >
        <path
          d="M0,420 L0,300 L80,240 L180,280 L260,190 L360,130 L440,175 L520,110 L620,155 L700,80 L780,125 L860,70 L940,115 L1020,155 L1100,100 L1180,145 L1280,195 L1380,230 L1440,210 L1440,420 Z"
          fill="rgba(145,120,140,0.55)"
        />
      </svg>

      {/* Mid mountains — warm green */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 390"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.62 }}
      >
        <defs>
          <linearGradient id="midMtnSummerWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(98,140,90,0.78)" />
            <stop offset="100%" stopColor="rgba(88,130,78,0.58)" />
          </linearGradient>
        </defs>
        <path
          d="M0,390 L0,310 L100,240 L200,280 L300,195 L400,250 L500,170 L590,215 L680,135 L760,185 L840,110 L920,165 L1000,130 L1080,180 L1160,145 L1250,195 L1360,245 L1440,225 L1440,390 Z"
          fill="url(#midMtnSummerWarm)"
        />
        <path
          d="M680,135 L700,165 L718,148 L736,168 L760,185 L734,175 L714,154 L698,172 L680,135Z"
          fill="rgba(190,170,120,0.45)"
        />
        <path
          d="M840,110 L860,142 L878,126 L895,144 L918,165 L892,155 L874,132 L858,148 L840,110Z"
          fill="rgba(190,170,120,0.45)"
        />
      </svg>

      {/* Front forest hills */}
      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 360"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.92 }}
      >
        <defs>
          <linearGradient id="frontHillSummerWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,96,62,0.92)" />
            <stop offset="100%" stopColor="rgba(65,116,72,0.78)" />
          </linearGradient>
        </defs>
        <path
          d="M0,360 L0,300 L80,265 L160,285 L240,240 L340,260 L420,220 L500,245 L580,200 L660,235 L740,195 L820,230 L900,195 L980,230 L1060,200 L1140,240 L1220,218 L1300,255 L1380,275 L1440,265 L1440,360 Z"
          fill="url(#frontHillSummerWarm)"
        />
        {[60,140,220,320,420,510,600,680,760,840,920,1000,1080,1160,1240,1340,1420].map((x, i) => {
          const h = 18 + (i % 4) * 7
          const y = 260 - (i % 3) * 8
          return (
            <path
              key={i}
              d={`M${x},${y} L${x - 8},${y + h} L${x + 8},${y + h} Z`}
              fill="rgba(30,70,40,0.72)"
            />
          )
        })}
      </svg>

      {/* Meadow */}
      <div
        className="absolute bottom-0 inset-x-0"
        style={{
          height: '16%',
          background:
            'linear-gradient(180deg, rgba(210,190,140,0) 0%, rgba(190,210,140,0.28) 45%, rgba(190,220,150,0.55) 100%)',
        }}
      />

      {/* Soft mist */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: '13%',
          height: '18%',
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,245,220,0.18) 50%, transparent 100%)',
          filter: 'blur(14px)',
        }}
      />
    </div>
  )
}

// ─── Particles ───────────────────────────────────────────────────────────────
function SnowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const count = 180

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const flakes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.2 + Math.random() * 3,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0.28 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const f of flakes) {
        f.y += f.speed
        f.x += f.drift + Math.sin(t * 0.001 + f.phase) * 0.3
        if (f.y > canvas.height) { f.y = -8; f.x = Math.random() * canvas.width }
        if (f.x > canvas.width + 10) f.x = -10
        if (f.x < -10) f.x = canvas.width + 10

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,240,255,${f.opacity})`
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />
}

function PollenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const count = 90

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const motes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.2 + Math.random() * 3.2,
      speedY: -0.12 - Math.random() * 0.32,
      speedX: (Math.random() - 0.5) * 0.26,
      opacity: 0.10 + Math.random() * 0.30,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const m of motes) {
        m.y += m.speedY
        m.x += m.speedX + Math.sin(t * 0.0008 + m.phase) * 0.2
        if (m.y < -10) { m.y = canvas.height + 10; m.x = Math.random() * canvas.width }
        if (m.x > canvas.width + 10) m.x = -10
        if (m.x < -10) m.x = canvas.width + 10

        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.6)
        grd.addColorStop(0, `rgba(255,210,120,${m.opacity})`)
        grd.addColorStop(1, `rgba(255,170,80,0)`)
        ctx.beginPath()
        ctx.arc(m.x, m.y, m.r * 2.6, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }} />
}

export function HeroCanvas() {
  const { season } = useSeason()
  return (
    <div className="absolute inset-0 w-full h-full">
      {season === 'winter' ? <WinterBackground /> : <SummerBackground />}
      {season === 'winter' ? <SnowCanvas /> : <PollenCanvas />}
    </div>
  )
}