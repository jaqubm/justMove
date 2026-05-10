import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ActivityCard from '@/components/activity-card'
import { calculateXP } from '@/lib/game'

const FILTERS = ['All', 'Run', 'Walk', 'Gym', 'Cycle', 'Yoga']

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: activities }, { data: profile }] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('current_streak, xp')
      .eq('id', user.id)
      .maybeSingle(),
  ])

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
    <>
      {/* ── Mobile ── */}
      <div className="md:hidden">
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
            overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none',
          }}>
            {FILTERS.map((f, i) => (
              <span key={f} style={{
                flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 999,
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
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block" style={{ padding: '28px 36px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--ink)',
          }}>Log</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {count} {count === 1 ? 'activity' : 'activities'} · {totalMinutes.toLocaleString()}m total
          </div>
        </div>

        {/* 4 stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { val: count, lab: 'Total activities' },
            { val: `${totalMinutes.toLocaleString()}m`, lab: 'Total minutes' },
            { val: `${profile?.current_streak ?? 0}d`, lab: 'Current streak' },
            { val: (profile?.xp ?? 0).toLocaleString(), lab: 'Total XP' },
          ].map(tile => (
            <div key={tile.lab} style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 16, padding: '16px 18px',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
                color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.03em',
              }}>{tile.val}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6,
              }}>{tile.lab}</div>
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Filter:</span>
          {FILTERS.map((f, i) => (
            <span key={f} style={{
              height: 30, padding: '0 12px', borderRadius: 999,
              background: i === 0 ? 'var(--ink)' : 'transparent',
              color: i === 0 ? 'var(--bg)' : 'var(--ink-muted)',
              border: `1px solid ${i === 0 ? 'transparent' : 'var(--line)'}`,
              display: 'inline-flex', alignItems: 'center',
              fontSize: 12, fontWeight: 600, cursor: 'default',
            }}>{f}</span>
          ))}
        </div>

        {/* Activity table */}
        {activitiesWithUrls.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', textAlign: 'center', padding: '48px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            No activities yet
          </p>
        ) : (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '56px 1fr 140px 80px 70px 1fr',
              padding: '10px 16px', borderBottom: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
            }}>
              <span>Proof</span>
              <span>Activity</span>
              <span>When</span>
              <span>Min</span>
              <span>XP</span>
              <span>Note</span>
            </div>
            {/* Table rows */}
            {activitiesWithUrls.map(({ activity, photoUrl }, idx) => {
              const when = new Date(activity.logged_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })
              const xp = calculateXP(activity.duration_minutes, 0)
              return (
                <div key={activity.id} style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr 140px 80px 70px 1fr',
                  padding: '10px 16px', alignItems: 'center',
                  borderBottom: idx < activitiesWithUrls.length - 1 ? '1px solid var(--line-soft)' : 'none',
                }}>
                  {/* Proof thumbnail */}
                  <div>
                    {photoUrl ? (
                      <Image src={photoUrl} alt="Activity proof photo" width={40} height={40}
                        style={{ borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, background: 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="var(--ink-dim)" strokeWidth="1.6" strokeLinecap="round">
                          <rect x="3" y="5" width="18" height="14" rx="3"/>
                          <circle cx="12" cy="12" r="3.5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Activity type */}
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                    textTransform: 'capitalize',
                  }}>{activity.type}</div>
                  {/* When */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>{when}</div>
                  {/* Minutes */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                    {activity.duration_minutes}m
                  </div>
                  {/* XP */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                    +{xp}
                  </div>
                  {/* Note */}
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{activity.note ?? '—'}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
