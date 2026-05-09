import { xpToNextLevel } from '@/lib/game'

interface Props {
  level: number
  xp: number
}

export default function XPBar({ level, xp }: Props) {
  const needed = xpToNextLevel(level)
  const pct = Math.min(100, (xp / needed) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-xs" style={{ color: 'var(--ink-dim)' }}>
          {xp.toLocaleString()} / {needed.toLocaleString()} XP
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>Lv {level}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface2)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}
