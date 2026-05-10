import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ActivityCard from '@/components/activity-card'

const FILTERS = ['All', 'Run', 'Walk', 'Gym', 'Cycle', 'Yoga']

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(100)

  const activitiesWithUrls = await Promise.all(
    (activities ?? []).map(async activity => {
      if (!activity.photo_url) return { activity, photoUrl: null }
      try {
        const { data } = await supabase.storage
          .from('activity-proofs').createSignedUrl(activity.photo_url, 3600)
        return { activity, photoUrl: data?.signedUrl ?? null }
      } catch {
        return { activity, photoUrl: null }
      }
    })
  )

  const grouped: Record<string, typeof activitiesWithUrls> = {}
  for (const item of activitiesWithUrls) {
    const date = new Date(item.activity.logged_at).toISOString().split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item)
  }

  const totalMinutes = (activities ?? []).reduce((s, a) => s + a.duration_minutes, 0)
  const count        = activities?.length ?? 0

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1,
        }}>Log</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
          marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {count} {count === 1 ? 'activity' : 'activities'} · {totalMinutes.toLocaleString()}m total
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 18,
        overflowX: 'auto', paddingBottom: 2,
        scrollbarWidth: 'none',
      }}>
        {FILTERS.map((f, i) => (
          <span key={f} style={{
            flexShrink: 0,
            height: 30, padding: '0 12px', borderRadius: 999,
            background: i === 0 ? 'var(--ink)' : 'transparent',
            color: i === 0 ? 'var(--bg)' : 'var(--ink-muted)',
            border: `1px solid ${i === 0 ? 'transparent' : 'var(--line)'}`,
            display: 'inline-flex', alignItems: 'center',
            fontSize: 12, fontWeight: 600, cursor: 'default',
          }}>{f}</span>
        ))}
      </div>

      {/* Empty state */}
      {Object.keys(grouped).length === 0 && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)',
          textAlign: 'center', padding: '48px 0',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>No activities yet</p>
      )}

      {/* Grouped entries */}
      {Object.entries(grouped).map(([date, items]) => {
        const label = new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short',
        }).toUpperCase()
        return (
          <div key={date} style={{ marginBottom: 18 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
              letterSpacing: '0.06em', marginBottom: 6,
            }}>{label}</div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 18, padding: '0 16px',
            }}>
              {items.map(({ activity, photoUrl }) => (
                <ActivityCard key={activity.id} activity={activity} photoUrl={photoUrl} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
