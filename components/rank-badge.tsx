'use client'
import { useId } from 'react'
import { getRankInfo } from '@/lib/game'

interface Props {
  level: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function RankBadge({ level, size = 'md', showLabel }: Props) {
  const r        = getRankInfo(level)
  const show     = showLabel ?? size !== 'sm'
  const sz       = size === 'lg'
    ? { box: 64, name: 18, sub: 11, gap: 14 }
    : size === 'sm'
    ? { box: 32, name: 12, sub: 9,  gap: 8  }
    : { box: 44, name: 14, sub: 10, gap: 10 }
  const pipsFilled = r.roman === 'I' ? 3 : r.roman === 'II' ? 2 : 1
  const uid     = useId()
  const gradId   = `rg-${uid.replace(/:/g, '')}`

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: sz.gap }}>
      <div style={{
        position: 'relative', width: sz.box, height: sz.box,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width={sz.box} height={sz.box} viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={r.color} stopOpacity="1" />
              <stop offset="1" stopColor={r.color} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M32 3l24 8v18c0 14-10 25-24 32C18 54 8 43 8 29V11z"
            fill={`url(#${gradId})`} stroke={r.color} strokeWidth="1.2" strokeOpacity="0.9" />
          <path d="M32 3l24 8v18c0 14-10 25-24 32C18 54 8 43 8 29V11z"
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        </svg>
        <span style={{
          position: 'relative', color: r.ink, fontWeight: 800,
          fontFamily: 'var(--font-display)',
          fontSize: sz.box * 0.34, letterSpacing: '-0.02em', lineHeight: 1,
          textShadow: '0 1px 0 rgba(0,0,0,.15)',
        }}>{r.roman}</span>
      </div>

      {show && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: sz.name, fontWeight: 700,
              color: 'var(--ink)', letterSpacing: '-0.02em',
            }}>{r.name}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: sz.sub, color: r.color,
              fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>{r.roman}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: sz.sub - 2, height: 3, display: 'inline-block',
                background: i < pipsFilled ? r.color : `${r.color}33`,
                borderRadius: 1,
              }} />
            ))}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: sz.sub,
              color: 'var(--ink-dim)', marginLeft: 4,
            }}>L{level}</span>
          </div>
        </div>
      )}
    </div>
  )
}
