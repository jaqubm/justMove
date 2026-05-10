interface Day {
  date: string
  minutes_logged: number
}

interface Props {
  days: Day[]
}

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StreakTimeline({ days }: Props) {
  const today = new Date().toISOString().split('T')[0]

  // Last 14 days newest-first
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const entry = days.find(x => x.date === date)
    const isToday = date === today
    return {
      date, mins: entry?.minutes_logged ?? 0, isToday,
      dayLabel: isToday ? 'Today' : i === 1 ? 'Yesterday'
        : DAY_LABELS[(d.getDay() + 6) % 7],
      dateLabel: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    }
  })

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 18, padding: 16,
    }}>
      {last14.map((d, i) => {
        const ok     = d.mins >= 30
        const isLast = i === last14.length - 1
        return (
          <div key={d.date} style={{ display: 'flex', gap: 14, position: 'relative' }}>
            {/* Rail */}
            <div style={{
              width: 28, position: 'relative', flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 7, marginTop: 6,
                background: ok ? 'var(--accent)' : 'var(--surface2)',
                border: ok ? 'none' : '2px solid var(--line)',
                outline: d.isToday ? '3px solid var(--flame)' : 'none',
                outlineOffset: 2, position: 'relative', zIndex: 2, flexShrink: 0,
              }} />
              {!isLast && (
                <div style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: -1 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                }}>{d.dayLabel}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{d.dateLabel}</span>
                {d.isToday && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px',
                    background: 'var(--flame-soft)', color: 'var(--flame)',
                    borderRadius: 999, fontSize: 9, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>live</span>
                )}
              </div>
              {d.mins > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: ok ? 'var(--ink)' : 'var(--danger)',
                  }}>{d.mins}m</span>
                  {ok && d.mins > 30 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--accent)', fontWeight: 700,
                    }}>+{(d.mins - 30)}m bonus</span>
                  )}
                </div>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>rest day</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
