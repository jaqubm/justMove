import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakTimeline from '@/components/streak-timeline'

export default async function StreakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const fourteenAgo = new Date(); fourteenAgo.setDate(fourteenAgo.getDate() - 13)

  const [{ data: profile }, { data: streakDays }, { count: daysMoved }] = await Promise.all([
    supabase.from('profiles')
      .select('current_streak, best_streak, total_minutes')
      .eq('id', user.id).maybeSingle(),
    supabase.from('streak_days')
      .select('date, minutes_logged')
      .eq('user_id', user.id)
      .gte('date', fourteenAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    supabase.from('streak_days')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('minutes_logged', 30),
  ])

  if (!profile) redirect('/')

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Link href="/home" style={{ fontSize: 15, color: 'var(--ink-dim)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/>
          <circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/>
        </svg>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--flame)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
        }}>current streak</div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800,
            lineHeight: 0.9, letterSpacing: '-0.06em', color: 'var(--ink)',
          }}>{profile.current_streak}</span>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="var(--flame)" strokeWidth="2.2" strokeLinecap="round"
            style={{ position: 'absolute', top: 0, right: -40 }}>
            <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-4 1 2 3 1 3-4z" />
          </svg>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: -6,
        }}>DAYS</div>
      </div>

      {/* Stats triple */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
        {[
          { val: profile.best_streak,                              lab: 'Best ever' },
          { val: daysMoved ?? 0,                                   lab: 'Days moved' },
          { val: Math.round((profile.total_minutes ?? 0) / 60),    lab: 'Hours total' },
        ].map(s => (
          <div key={s.lab} style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 12, textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
              color: 'var(--ink)', lineHeight: 1,
            }}>{s.val}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4,
            }}>{s.lab}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
      }}>last 14 days</div>
      <StreakTimeline days={streakDays ?? []} />

      <div style={{ height: 24 }} />
    </div>
  )
}
