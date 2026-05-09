interface Props {
  streak: number
  size?: 'sm' | 'lg'
}

export default function StreakCounter({ streak, size = 'lg' }: Props) {
  const numClass = size === 'lg' ? 'text-7xl' : 'text-4xl'
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={`font-bold tabular-nums ${numClass}`}
        style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
      >
        {streak}
      </span>
      <span className="text-2xl" style={{ color: 'var(--flame)' }}>🔥</span>
      <span className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>
        {streak === 1 ? 'day' : 'days'}
      </span>
    </div>
  )
}
