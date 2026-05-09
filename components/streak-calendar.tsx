interface Props {
  streakDays: { date: string; minutes_logged: number }[]
  currentStreak: number
  bestStreak: number
}

export default function StreakCalendar({ streakDays, currentStreak, bestStreak }: Props) {
  const dayMap = new Map(streakDays.map(d => [d.date, d.minutes_logged]))

  const today = new Date()
  const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (90 - i))
    return d.toISOString().split('T')[0]
  })

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl p-4 border border-line">
          <p className="text-xs text-ink-dim font-mono mb-1">Current streak</p>
          <p className="text-3xl font-display font-bold text-ink">{currentStreak} <span className="text-base">🔥</span></p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-line">
          <p className="text-xs text-ink-dim font-mono mb-1">Best streak</p>
          <p className="text-3xl font-display font-bold text-ink">{bestStreak} <span className="text-base text-ink-dim">days</span></p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-surface rounded-xl p-4 border border-line space-y-2">
        <p className="text-xs font-mono text-ink-dim uppercase tracking-wider mb-3">Last 13 weeks</p>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d, i) => (
            <span key={i} className="text-center text-xs text-ink-dim font-mono">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(date => {
            const mins = dayMap.get(date) ?? 0
            const met  = mins >= 30
            const isToday = date === today.toISOString().split('T')[0]
            return (
              <div
                key={date}
                title={`${date}: ${mins} min`}
                className={`aspect-square rounded-sm transition-colors ${
                  isToday
                    ? 'ring-2 ring-accent'
                    : ''
                }`}
                style={{
                  backgroundColor: met
                    ? `color-mix(in srgb, var(--accent) ${Math.min(100, 40 + (mins / 60) * 60)}%, transparent)`
                    : 'var(--surface2)',
                }}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className="w-3 h-3 rounded-sm bg-surface2" />
          <span className="text-xs text-ink-dim">0 min</span>
          <div className="w-3 h-3 rounded-sm ml-2" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="text-xs text-ink-dim">≥30 min</span>
        </div>
      </div>
    </div>
  )
}
