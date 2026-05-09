import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakCounter from '@/components/streak-counter'
import DayProgress from '@/components/day-progress'
import ActivityCard from '@/components/activity-card'
import RankBadge from '@/components/rank-badge'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: profile }, { data: streakDay }, { data: todayActivities }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('streak_days').select('minutes_logged').eq('user_id', user.id).eq('date', today).maybeSingle(),
      supabase.from('activities').select('*').eq('user_id', user.id)
        .gte('logged_at', `${today}T00:00:00Z`)
        .order('logged_at', { ascending: false }),
    ])

  if (!profile) redirect('/')

  const minutesToday = streakDay?.minutes_logged ?? 0

  const activitiesWithUrls = await Promise.all(
    (todayActivities ?? []).map(async activity => {
      const { data } = await supabase.storage
        .from('activity-proofs')
        .createSignedUrl(activity.photo_url, 3600)
      return { activity, photoUrl: data?.signedUrl ?? null }
    })
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--ink-dim)' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {getGreeting()}, {profile.display_name.split(' ')[0]}
          </h1>
        </div>
        <RankBadge level={profile.level} size="sm" />
      </div>

      {/* Streak card */}
      <div className="rounded-2xl p-5 border space-y-4"
           style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}>
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ink-dim)' }}>
          Current Streak
        </p>
        <StreakCounter streak={profile.current_streak} />
        <DayProgress minutesToday={minutesToday} currentStreak={profile.current_streak} />
      </div>

      {/* Log activity CTA */}
      <Link
        href="/add"
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-80"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log activity
      </Link>

      {/* Today's activities */}
      {activitiesWithUrls.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--ink-dim)' }}>
            Today
          </p>
          {activitiesWithUrls.map(({ activity, photoUrl }) => (
            <ActivityCard key={activity.id} activity={activity} photoUrl={photoUrl} />
          ))}
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getUTCHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
