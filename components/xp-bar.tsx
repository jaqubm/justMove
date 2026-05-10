import { xpToNextLevel } from '@/lib/game'

interface Props {
  level: number
  xp: number
}

export default function XPBar({ level, xp }: Props) {
  const needed = xpToNextLevel(level)
  const pct    = Math.min(100, (xp / needed) * 100)

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)',
        }}>
          Level <span style={{ color: 'var(--accent)' }}>{level}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
          {xp.toLocaleString()}<span style={{ opacity: 0.5 }}> / {needed.toLocaleString()} xp</span>
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'var(--accent)', borderRadius: 999, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}
