interface Props {
  minutesToday: number
  currentStreak: number
}

export default function DayProgress({ minutesToday, currentStreak }: Props) {
  const basePct   = Math.min(100, (minutesToday / 30) * 100)
  const bonusMins = Math.max(0, minutesToday - 30)
  const multiplier = (1 + 0.05 * currentStreak).toFixed(2)
  const met = minutesToday >= 30

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="font-mono" style={{ color: 'var(--ink-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>{minutesToday}</span> / 30 min today
        </span>
        {currentStreak > 0 && (
          <span className="font-mono" style={{ color: 'var(--flame)' }}>
            ×{multiplier} bonus XP
          </span>
        )}
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface2)' }}>
        <div
          className="h-full transition-all duration-500 rounded-l-full"
          style={{ width: `${met ? 100 : basePct}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>
      {met && bonusMins > 0 && (
        <p className="text-xs font-mono" style={{ color: 'var(--flame)' }}>
          +{bonusMins}min bonus 🔥
        </p>
      )}
      {met && bonusMins === 0 && (
        <p className="text-xs font-mono" style={{ color: 'var(--flame)' }}>
          Streak alive! Keep going 🔥
        </p>
      )}
    </div>
  )
}
