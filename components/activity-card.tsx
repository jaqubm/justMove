import ActivityGlyph from './activity-glyph'
import type { Activity, ActivityType } from '@/lib/types'
import { ACTIVITY_LABELS } from '@/lib/types'

interface Props {
  activity: Activity
  photoUrl: string | null
}

export default function ActivityCard({ activity, photoUrl }: Props) {
  const date = new Date(activity.logged_at)
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const activityType = activity.type as ActivityType

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--surface2)', color: 'var(--ink-muted)' }}
      >
        <ActivityGlyph type={activityType} size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          {ACTIVITY_LABELS[activityType] ?? activity.type}
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--ink-dim)' }}>
          {activity.duration_minutes}min · {dateStr} {timeStr}
        </p>
      </div>
      {photoUrl && (
        <img
          src={photoUrl}
          alt="Activity proof"
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
        />
      )}
    </div>
  )
}
