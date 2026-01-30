'use client'

import { useMemo } from 'react'

// Fixed seed for consistent layout
const NODES = [
  { x: 10, y: 15 }, { x: 25, y: 8 }, { x: 40, y: 20 }, { x: 55, y: 12 }, { x: 70, y: 25 },
  { x: 85, y: 18 }, { x: 15, y: 35 }, { x: 35, y: 45 }, { x: 50, y: 38 }, { x: 65, y: 50 },
  { x: 80, y: 42 }, { x: 20, y: 65 }, { x: 45, y: 70 }, { x: 60, y: 62 }, { x: 75, y: 75 },
  { x: 30, y: 85 }, { x: 90, y: 55 }, { x: 5, y: 50 }, { x: 95, y: 30 }, { x: 50, y: 5 },
]
// Connections: pairs of node indices (simplified mesh)
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [1, 8], [2, 7], [3, 9], [4, 10],
  [6, 7], [7, 8], [8, 9], [9, 10], [6, 11], [7, 12], [8, 13], [9, 14], [11, 12], [12, 13],
  [13, 14], [2, 8], [5, 10], [10, 16], [0, 17], [5, 18], [1, 19], [3, 13],
]

const darkStyles = {
  base: `
    radial-gradient(ellipse 120% 80% at 20% 20%, rgba(0, 242, 255, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 100% 100% at 80% 80%, rgba(112, 0, 255, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255, 0, 200, 0.06) 0%, transparent 55%),
    #05070A
  `,
  vignette: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(5, 7, 10, 0.4) 100%)',
  lineCyan: { 0: 0.2, 50: 0.8, 100: 0.2 },
  lineViolet: { 0: 0.2, 50: 0.8, 100: 0.2 },
  lineMagenta: { 0: 0.2, 50: 0.6, 100: 0.2 },
  colors: { cyan: '#00F2FF', violet: '#7000FF', magenta: '#E040FB' },
  nodeOpacity: 0.65,
  svgOpacity: 0.7,
  particleCyan: 'bg-electric-cyan/40',
  particleViolet: 'bg-neon-violet/30',
}

const lightStyles = {
  base: `
    radial-gradient(ellipse 120% 80% at 20% 20%, rgba(0, 172, 193, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 100% 100% at 80% 80%, rgba(124, 77, 255, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 50% 50%, rgba(156, 39, 176, 0.05) 0%, transparent 55%),
    #F5F7FA
  `,
  vignette: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(245, 247, 250, 0.6) 100%)',
  lineCyan: { 0: 0.08, 50: 0.35, 100: 0.08 },
  lineViolet: { 0: 0.08, 50: 0.35, 100: 0.08 },
  lineMagenta: { 0: 0.06, 50: 0.25, 100: 0.06 },
  colors: { cyan: '#0097A7', violet: '#7C4DFF', magenta: '#AB47BC' },
  nodeOpacity: 0.5,
  svgOpacity: 0.5,
  particleCyan: 'bg-[#0097A7]/25',
  particleViolet: 'bg-[#7C4DFF]/20',
}

export default function NeuralBackground({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const viewBox = '0 0 100 100'
  const isLight = theme === 'light'
  const s = isLight ? lightStyles : darkStyles
  const nodePos = useMemo(() => NODES.map(n => ({ x: n.x, y: n.y })), [])
  const paths = useMemo(() => EDGES.map(([a, b]) => {
    const p = nodePos[a]
    const q = nodePos[b]
    return `M ${p.x} ${p.y} L ${q.x} ${q.y}`
  }), [nodePos])

  const uid = `neural-${theme}`

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* Base + depth gradients (dark: deep space / light: white with subtle tint) */}
      <div
        className="absolute inset-0 opacity-100"
        style={{ background: s.base }}
      />
      {/* Neural network SVG */}
      <svg
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
        style={{ opacity: s.svgOpacity }}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`line-cyan-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={s.colors.cyan} stopOpacity={s.lineCyan[0]} />
            <stop offset="50%" stopColor={s.colors.cyan} stopOpacity={s.lineCyan[50]} />
            <stop offset="100%" stopColor={s.colors.cyan} stopOpacity={s.lineCyan[100]} />
          </linearGradient>
          <linearGradient id={`line-violet-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={s.colors.violet} stopOpacity={s.lineViolet[0]} />
            <stop offset="50%" stopColor={s.colors.violet} stopOpacity={s.lineViolet[50]} />
            <stop offset="100%" stopColor={s.colors.violet} stopOpacity={s.lineViolet[100]} />
          </linearGradient>
          <linearGradient id={`line-magenta-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={s.colors.magenta} stopOpacity={s.lineMagenta[0]} />
            <stop offset="50%" stopColor={s.colors.magenta} stopOpacity={s.lineMagenta[50]} />
            <stop offset="100%" stopColor={s.colors.magenta} stopOpacity={s.lineMagenta[100]} />
          </linearGradient>
          <filter id={`node-glow-${uid}`}>
            <feGaussianBlur stdDeviation={isLight ? 0.25 : 0.4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i % 3 === 0 ? `url(#line-cyan-${uid})` : i % 3 === 1 ? `url(#line-violet-${uid})` : `url(#line-magenta-${uid})`}
            strokeWidth="0.15"
            strokeOpacity="0.9"
            className="animate-neural-pulse"
            style={{ strokeDasharray: '1 1', animationDelay: `${i * 0.15}s` }}
          />
        ))}
        {nodePos.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i % 3 === 0 ? 0.55 : 0.4}
            fill={i % 3 === 0 ? s.colors.cyan : i % 3 === 1 ? s.colors.violet : s.colors.magenta}
            opacity={s.nodeOpacity + (i % 5) * 0.07}
            filter={`url(#node-glow-${uid})`}
          />
        ))}
      </svg>
      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${s.particleCyan} animate-float-particle`}
            style={{
              left: `${(i * 7 + 3) % 100}%`,
              top: `${(i * 11 + 5) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + (i % 10)}s`,
            }}
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className={`absolute w-1 h-1 rounded-full ${s.particleViolet} animate-float-particle`}
            style={{
              left: `${(i * 13 + 2) % 100}%`,
              top: `${(i * 17 + 8) % 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${18 + (i % 8)}s`,
            }}
          />
        ))}
      </div>
      {/* Vignette (dark: dark edges / light: very soft) */}
      <div
        className="absolute inset-0"
        style={{ background: s.vignette }}
      />
    </div>
  )
}
