import ActivityGlyph from './activity-glyph'
import type { Activity, ActivityType } from '@/lib/types'
import { ACTIVITY_LABELS } from '@/lib/types'
import { calculateXP } from '@/lib/game'

const HUES: Record<ActivityType, number> = {
  walk: 130, run: 16,  cycle: 200, gym: 280, yoga: 320,
  sport: 50, dance: 340, hike: 100, move: 70,
}

interface Props {
  activity: Activity
  photoUrl: string | null
}

export default function ActivityCard({ activity, photoUrl }: Props) {
  const date      = new Date(activity.logged_at)
  const timeLabel = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const type      = activity.type as ActivityType
  const hue       = HUES[type] ?? 90
  const xp        = calculateXP(activity.duration_minutes, 0)
  const ok        = activity.duration_minutes >= 30

  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '14px 0',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `oklch(0.32 0.05 ${hue})`,
        color: `oklch(0.85 0.15 ${hue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ActivityGlyph type={type} size={22} color={`oklch(0.85 0.15 ${hue})`} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--ink)',
          }}>{ACTIVITY_LABELS[type] ?? activity.type}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
            {timeLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            color: ok ? 'var(--ink)' : 'var(--danger)',
          }}>{activity.duration_minutes}m</span>
          <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>·</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--accent)', fontWeight: 700,
          }}>+{xp}xp</span>
        </div>
      </div>

      {photoUrl && (
        <img
          src={photoUrl}
          alt="proof"
          style={{
            width: 50, height: 50, borderRadius: 10,
            objectFit: 'cover', flexShrink: 0,
          }}
        />
      )}
    </div>
  )
}
