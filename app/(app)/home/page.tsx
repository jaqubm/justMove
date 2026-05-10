import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakCounter from '@/components/streak-counter'
import DayProgress from '@/components/day-progress'
import ActivityCard from '@/components/activity-card'
import RankBadge from '@/components/rank-badge'
import XPBar from '@/components/xp-bar'
import Image from 'next/image'
import { calculateXP, xpToNextLevel } from '@/lib/game'

export default async function HomePage() {
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const today        = new Date().toISOString().split('T')[0]
  const sevenAgo     = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 6)
  const weekStart    = sevenAgo.toISOString().split('T')[0]

  const [{ data: profile }, { data: streakDay }, { data: todayActivities }, { data: weekDays }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('streak_days').select('minutes_logged')
        .eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('activities').select('*').eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00Z`)
        .order('logged_at', { ascending: false }),
      supabase.from('streak_days').select('date, minutes_logged')
        .eq('user_id', user.id).gte('date', weekStart)
        .order('date', { ascending: true }),
    ])

  if (!profile) redirect('/')

  const minutesToday  = streakDay?.minutes_logged ?? 0
  const todayXP       = (todayActivities ?? []).reduce(
    (s, a) => s + calculateXP(a.duration_minutes, profile.current_streak), 0
  )
  const weekMinutes   = (weekDays ?? []).reduce((s, d) => s + d.minutes_logged, 0)
  const multiplier    = (1 + profile.current_streak * 0.05).toFixed(2)
  const xpNeeded      = xpToNextLevel(profile.level)

  // Build 7-day bar data (fill gaps with 0)
  const dayMap        = new Map((weekDays ?? []).map(d => [d.date, d.minutes_logged]))
  const weekBars      = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const date = d.toISOString().split('T')[0]
    return { date, mins: dayMap.get(date) ?? 0, label: ['M','T','W','T','F','S','S'][(d.getDay() + 6) % 7] }
  })
  const barMax        = Math.max(60, ...weekBars.map(b => b.mins))

  const activitiesWithUrls = await Promise.all(
    (todayActivities ?? []).map(async activity => {
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

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: 'var(--ink)', marginTop: 2,
          }}>
            {getGreeting()}, {profile.display_name?.split(' ')[0] || 'Mover'}
          </div>
        </div>
        {profile.avatar_url ? (
          <Image src={profile.avatar_url} alt={profile.display_name}
            width={42} height={42} style={{ borderRadius: '50%' }} />
        ) : (
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)',
          }}>
            {(profile.display_name?.[0] ?? 'M').toUpperCase()}
          </div>
        )}
      </div>

      {/* Hero streak card */}
      <div style={{
        background: `linear-gradient(160deg, var(--surface) 0%, var(--bg-raised) 100%)`,
        border: '1px solid var(--line)', borderRadius: 18, padding: 20, marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <StreakCounter streak={profile.current_streak} size="lg" />
          {todayXP > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 24, padding: '0 9px',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              borderRadius: 999, fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
            }}>
              +{todayXP}xp today
            </span>
          )}
        </div>
        <div style={{ height: 1, background: 'var(--line-soft)', margin: '14px 0' }} />
        <DayProgress minutesToday={minutesToday} />
      </div>

      {/* XP / level card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 18, padding: 18, marginBottom: 14,
      }}>
        <XPBar level={profile.level} xp={profile.xp} />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
        }}>
          <span>{xpNeeded - profile.xp} xp to L{profile.level + 1}</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>×{multiplier} streak boost</span>
        </div>
      </div>

      {/* This week */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
            This week
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
            {weekMinutes}m total
          </span>
        </div>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 18, padding: '14px 14px 8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
            {weekBars.map((b, i) => {
              const h    = Math.max(6, (b.mins / barMax) * 72)
              const ok   = b.mins >= 30
              const isToday = i === 6
              return (
                <div key={b.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: h,
                    background: ok ? 'var(--accent)' : 'var(--surface2)',
                    borderRadius: 4, opacity: ok ? 1 : 0.6,
                    outline: isToday ? '2px solid var(--flame)' : 'none',
                    outlineOffset: 1,
                  }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)', letterSpacing: '0.04em' }}>
                    {b.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Rank badge */}
      <div style={{ marginBottom: 14 }}>
        <RankBadge level={profile.level} size="md" />
      </div>

      {/* CTA */}
      <Link
        href="/add"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', height: 58, borderRadius: 16,
          background: 'var(--accent)', color: 'var(--accent-ink)', border: 'none',
          fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
          textDecoration: 'none', marginBottom: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Log activity
      </Link>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
        textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 24,
      }}>photo proof required</p>

      {/* Today's activities */}
      {activitiesWithUrls.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>Today</p>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 18, padding: '0 16px',
          }}>
            {activitiesWithUrls.map(({ activity, photoUrl }) => (
              <ActivityCard key={activity.id} activity={activity} photoUrl={photoUrl} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
