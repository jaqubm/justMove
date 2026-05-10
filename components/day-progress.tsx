interface Props {
  minutesToday: number
}

export default function DayProgress({ minutesToday }: Props) {
  const bonusMins   = Math.max(0, minutesToday - 30)
  const met         = minutesToday >= 30
  const totalMax    = 90
  const baselineAt  = (30 / totalMax) * 100
  const filledPct   = Math.min(100, (minutesToday / totalMax) * 100)
  const bonusPct    = met ? Math.min(100, filledPct) - baselineAt : 0

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
        }}>Today</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
          {minutesToday}<span style={{ color: 'var(--ink-dim)', fontWeight: 400 }}> / 30 min</span>
        </span>
      </div>

      <div style={{
        position: 'relative', height: 10, background: 'var(--surface2)',
        borderRadius: 999, overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${Math.min(baselineAt, filledPct)}%`,
          background: 'var(--accent)', borderRadius: 999,
        }} />
        {bonusPct > 0 && (
          <div style={{
            position: 'absolute', left: `${baselineAt}%`, top: 0, bottom: 0,
            width: `${bonusPct}%`,
            background: 'var(--flame)', borderRadius: '0 999px 999px 0',
          }} />
        )}
        <div style={{
          position: 'absolute', left: `${baselineAt}%`, top: -3, bottom: -3, width: 2,
          background: 'var(--bg)', borderLeft: '1.5px dashed var(--flame)',
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 6,
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
      }}>
        <span>baseline 30m</span>
        {bonusMins > 0
          ? <span style={{ color: 'var(--flame)', fontWeight: 700 }}>+{bonusMins}m bonus</span>
          : met
          ? <span style={{ color: 'var(--flame)', fontWeight: 700 }}>streak alive!</span>
          : null}
      </div>
    </div>
  )
}
