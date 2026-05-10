import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RankBadge from '@/components/rank-badge'
import XPBar from '@/components/xp-bar'
import EditNameForm from './edit-name-form'
import { getRankInfo } from '@/lib/game'
import Image from 'next/image'

const ACHIEVEMENTS = [
  { name: 'First steps',   icon: 'bolt',   unlocked: true  },
  { name: 'Week one',      icon: 'flame',  unlocked: true  },
  { name: 'Three weeks',   icon: 'flame',  unlocked: false },
  { name: 'Marathon mind', icon: 'flame',  unlocked: false },
  { name: 'Variety pack',  icon: 'star',   unlocked: true  },
  { name: 'Overachiever',  icon: 'bolt',   unlocked: false },
  { name: 'Night owl',     icon: 'eye',    unlocked: false },
  { name: 'Early bird',    icon: 'star',   unlocked: true  },
]

function AchievementIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    bolt:  <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="currentColor" stroke="none" />,
    flame: <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-4 1 2 3 1 3-4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
    star:  <path d="M12 3l2.6 5.7 6.4.6-4.8 4.4 1.5 6.3L12 17l-5.7 3 1.5-6.3L3 9.3l6.4-.6L12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    eye:   <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" /></>,
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] ?? paths.bolt}
    </svg>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: profile }, { count: activityCount }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (!profile) redirect('/')

  const rank    = getRankInfo(profile.level)
  const tierPct = Math.min(1, rank.levelInTier / rank.tierSize)

  async function signOut() {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  return (<>
    <div className="md:hidden" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>

      {/* Header card */}
      <div style={{
        background: 'linear-gradient(160deg, oklch(0.34 0.06 90), var(--surface))',
        borderRadius: 22, padding: '24px 18px 18px',
        marginBottom: 16, position: 'relative', overflow: 'hidden',
        border: '1px solid var(--line)',
      }}>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 00.4 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.4l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.4-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.4-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.4h0a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.4l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.4 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name}
              width={68} height={68} style={{ borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 68, height: 68, borderRadius: '50%', background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ink)',
            }}>{(profile.display_name?.[0] ?? 'M').toUpperCase()}</div>
          )}
          <div>
            <EditNameForm currentName={profile.display_name} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <RankBadge level={profile.level} size="md" />
        </div>

        {/* Tier progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>tier progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: rank.color, fontWeight: 700 }}>
              {rank.levelInTier}/{rank.tierSize}
              {rank.next && (
                <span style={{ color: 'var(--ink-dim)', fontWeight: 400, marginLeft: 6 }}>
                  → {rank.next.name}
                </span>
              )}
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${tierPct * 100}%`, height: '100%',
              background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
              borderRadius: 999,
            }} />
          </div>
        </div>

        <XPBar level={profile.level} xp={profile.xp} />
      </div>

      {/* 2×2 stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { val: profile.current_streak, sub: 'current',  lab: 'STREAK',     tone: 'var(--flame)' },
          { val: profile.best_streak,    sub: 'best',     lab: 'STREAK',     tone: 'var(--accent)' },
          { val: activityCount ?? 0,     sub: 'logged',   lab: 'ACTIVITIES', tone: undefined },
          { val: profile.xp,             sub: 'total',    lab: 'XP',         tone: undefined },
        ].map(s => (
          <div key={s.lab + s.sub} style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 14,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)',
              letterSpacing: '0.07em', fontWeight: 700, textTransform: 'uppercase',
            }}>{s.lab} · {s.sub}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
              color: s.tone ?? 'var(--ink)', lineHeight: 1.05, marginTop: 6,
            }}>{s.val.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          Achievements
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
          {ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
        {ACHIEVEMENTS.map(a => (
          <div key={a.name} style={{
            aspectRatio: '1', borderRadius: 14,
            background: a.unlocked ? 'var(--surface)' : 'transparent',
            border: `1px solid ${a.unlocked ? 'var(--line)' : 'var(--line-soft)'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, opacity: a.unlocked ? 1 : 0.4, padding: 4,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: a.unlocked ? 'var(--accent)' : 'var(--surface2)',
              color: a.unlocked ? 'var(--accent-ink)' : 'var(--ink-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AchievementIcon name={a.icon} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: 'var(--ink)',
              textAlign: 'center', lineHeight: 1.1, padding: '0 2px', textTransform: 'uppercase',
            }}>{a.name}</span>
          </div>
        ))}
      </div>

      {/* Settings strip */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', marginBottom: 24 }}>
        {[
          { lab: 'Notifications', val: 'On'      },
          { lab: 'Privacy',       val: 'Friends' },
          { lab: 'Export data',   val: ''        },
        ].map(row => (
          <div key={row.lab} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid var(--line-soft)',
            color: 'var(--ink)', fontSize: 14, fontWeight: 500,
          }}>
            <span>{row.lab}</span>
            <span style={{ color: 'var(--ink-dim)', fontSize: 13 }}>
              {row.val} <span style={{ marginLeft: 4 }}>›</span>
            </span>
          </div>
        ))}
        <form action={signOut}>
          <button type="submit" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', padding: '14px 16px', background: 'none', border: 'none',
            color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left',
          }}>
            Sign out
          </button>
        </form>
      </div>
    </div>

    {/* ── Desktop ── */}
    <div className="hidden md:block" style={{ padding: '28px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header card */}
      <div style={{
        background: 'linear-gradient(160deg, oklch(0.34 0.06 90), var(--surface))',
        borderRadius: 22, padding: '28px 32px', marginBottom: 20,
        border: '1px solid var(--line)', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Avatar 96px */}
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name ?? 'avatar'}
              width={96} height={96} style={{ borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 96, height: 96, borderRadius: '50%', background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--ink-muted)',
            }}>{(profile.display_name?.[0] ?? 'M').toUpperCase()}</div>
          )}
          {/* Name + edit */}
          <div style={{ flex: 1 }}>
            <EditNameForm currentName={profile.display_name ?? ''} />
          </div>
          {/* Rank badge + XP bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
            <RankBadge level={profile.level} size="lg" />
            <div style={{ width: 200 }}>
              <XPBar xp={profile.xp} level={profile.level} />
            </div>
          </div>
          {/* Sign out */}
          <form action={signOut}>
            <button type="submit" style={{
              height: 36, padding: '0 16px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--line)',
              color: 'var(--ink-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}>Sign out</button>
          </form>
        </div>
      </div>

      {/* 4-col stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { val: activityCount ?? 0, lab: 'Activities' },
          { val: `${profile.best_streak}d`, lab: 'Best streak' },
          { val: Math.round((profile.total_minutes ?? 0) / 60), lab: 'Hours moved' },
          { val: profile.level, lab: 'Level' },
        ].map(s => (
          <div key={s.lab} style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 16, padding: '16px 18px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.03em' }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>{s.lab}</div>
          </div>
        ))}
      </div>

      {/* Achievements — 6-col grid */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '20px 22px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Achievements</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.name} style={{
              background: a.unlocked ? 'var(--surface2)' : 'transparent',
              border: `1px solid ${a.unlocked ? 'var(--line)' : 'var(--line-soft)'}`,
              borderRadius: 14, padding: '12px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              opacity: a.unlocked ? 1 : 0.4,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: a.unlocked ? 'color-mix(in srgb, var(--accent) 16%, transparent)' : 'var(--surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: a.unlocked ? 'var(--accent)' : 'var(--ink-dim)',
              }}>
                <AchievementIcon name={a.icon} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.3 }}>{a.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>)
}
