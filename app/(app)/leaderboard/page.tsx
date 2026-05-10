import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'

const TABS = [
  { key: 'streak',  label: 'Streak'  },
  { key: 'xp',     label: 'XP'      },
  { key: 'minutes', label: 'Minutes' },
]

const PODIUM_HEIGHTS: Record<number, number> = { 1: 130, 2: 105, 3: 95 }

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'streak' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const sortColumn = sort === 'xp' ? 'xp'
    : sort === 'minutes' ? 'total_minutes'
    : 'current_streak'

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, level, xp, current_streak, total_minutes')
    .order(sortColumn, { ascending: false })
    .limit(50)

  const top3 = (profiles ?? []).slice(0, 3)
  const rest = (profiles ?? []).slice(3)

  function getValue(p: { xp: number; total_minutes: number; current_streak: number }) {
    if (sort === 'xp')      return `${p.xp.toLocaleString()} XP`
    if (sort === 'minutes') return `${p.total_minutes.toLocaleString()}m`
    return `${p.current_streak}d`
  }

  // Podium order: 2nd left, 1st center, 3rd right
  const podium = top3.length >= 3
    ? [{ ...top3[1], place: 2 }, { ...top3[0], place: 1 }, { ...top3[2], place: 3 }]
    : top3.map((p, i) => ({ ...p, place: i + 1 }))

  return (
    <>
    <div className="md:hidden" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
          letterSpacing: '-0.03em', color: 'var(--ink)',
        }}>Friends</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>weekly streak board</div>
      </div>

      {/* Segmented control */}
      <div style={{
        display: 'flex', background: 'var(--surface)', borderRadius: 12,
        padding: 4, marginBottom: 18, border: '1px solid var(--line)',
      }}>
        {TABS.map(tab => (
          <a
            key={tab.key}
            href={`/leaderboard?sort=${tab.key}`}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 9, textAlign: 'center',
              background: sort === tab.key ? 'var(--bg)' : 'transparent',
              color: sort === tab.key ? 'var(--ink)' : 'var(--ink-dim)',
              fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit',
            }}
          >{tab.label}</a>
        ))}
      </div>

      {/* Podium */}
      {podium.length >= 3 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr',
          gap: 8, marginBottom: 18, alignItems: 'flex-end',
        }}>
          {podium.map(p => (
            <div key={p.id} style={{ textAlign: 'center' }}>
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt={p.display_name}
                  width={48} height={48}
                  style={{ borderRadius: '50%', margin: '0 auto' }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)',
                }}>{(p.display_name?.[0] ?? '?').toUpperCase()}</div>
              )}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                marginTop: 8, color: 'var(--ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{p.display_name}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--flame)',
                fontWeight: 700, marginBottom: 8,
              }}>{getValue(p)}</div>
              <div style={{
                height: PODIUM_HEIGHTS[p.place],
                background: p.place === 1 ? 'var(--accent)' : 'var(--surface)',
                borderRadius: '14px 14px 0 0',
                border: p.place === 1 ? 'none' : '1px solid var(--line)',
                color: p.place === 1 ? 'var(--accent-ink)' : 'var(--ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em',
              }}>{p.place}</div>
            </div>
          ))}
        </div>
      )}

      {/* List: 4th onward */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 18, overflow: 'hidden',
      }}>
        {rest.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
            textAlign: 'center', padding: '24px 0', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>Only {top3.length} {top3.length === 1 ? 'player' : 'players'} so far</p>
        )}
        {rest.map((p, i) => {
          const isMe = p.id === user.id
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: i === rest.length - 1 ? 'none' : '1px solid var(--line-soft)',
              background: isMe
                ? 'color-mix(in srgb, var(--accent) 8%, transparent)'
                : 'transparent',
              outline: isMe ? '1px solid var(--accent)' : 'none',
              outlineOffset: -1,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', width: 22, fontSize: 13,
                color: 'var(--ink-dim)', fontWeight: 700, textAlign: 'right', flexShrink: 0,
              }}>{i + 4}</span>
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt={p.display_name}
                  width={36} height={36}
                  style={{
                    borderRadius: '50%', flexShrink: 0,
                    outline: isMe ? '2px solid var(--accent)' : 'none', outlineOffset: 2,
                  }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)',
                }}>{(p.display_name?.[0] ?? '?').toUpperCase()}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  {p.display_name}
                  {isMe && <span style={{ color: 'var(--accent)', fontSize: 11, marginLeft: 6 }}>· you</span>}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2,
                }}>
                  LV {p.level} · {p.xp.toLocaleString()} XP
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 13,
                color: 'var(--flame)', fontWeight: 700, flexShrink: 0,
              }}>{getValue(p)}</div>
            </div>
          )
        })}
      </div>

      <div style={{ height: 24 }} />
    </div>

    {/* ── Desktop ── */}
    <div className="hidden md:block" style={{ padding: '28px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header with tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Friends</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>weekly board</div>
        </div>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 12, padding: 4, gap: 2,
        }}>
          {TABS.map(tab => (
            <a key={tab.key} href={`?sort=${tab.key}`} style={{
              height: 36, padding: '0 18px', borderRadius: 9,
              background: sort === tab.key ? 'var(--ink)' : 'transparent',
              color: sort === tab.key ? 'var(--bg)' : 'var(--ink-muted)',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none',
            }}>{tab.label}</a>
          ))}
        </div>
      </div>

      {/* Gradient podium card */}
      {top3.length >= 3 && (
        <div style={{
          background: 'oklch(0.22 0.05 90)',
          borderRadius: 22, padding: '32px 40px 0', marginBottom: 20,
          border: '1px solid var(--line)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16,
        }}>
          {podium.map(p => {
            const colHeight = p.place === 1 ? 200 : p.place === 2 ? 160 : 130
            const isMe = p.id === user.id
            return (
              <div key={p.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                width: 140,
              }}>
                {/* Avatar */}
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt={p.display_name ?? 'avatar'} width={56} height={56}
                    style={{ borderRadius: '50%', border: isMe ? '3px solid var(--accent)' : '2px solid var(--line)' }} />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: 'var(--surface2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink-muted)',
                    border: isMe ? '3px solid var(--accent)' : '2px solid var(--line)',
                  }}>{(p.display_name?.[0] ?? '?').toUpperCase()}</div>
                )}
                {/* Name */}
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
                  color: isMe ? 'var(--accent)' : 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 130, textAlign: 'center',
                }}>{isMe ? 'You' : (p.display_name ?? 'Mover')}</div>
                {/* Value */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                  {getValue(p)}
                </div>
                {/* Podium column */}
                <div style={{
                  width: '100%', height: colHeight, borderRadius: '10px 10px 0 0',
                  background: p.place === 1
                    ? 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 40%, transparent), color-mix(in srgb, var(--accent) 12%, transparent))'
                    : 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: p.place === 1 ? 40 : 28, fontWeight: 800,
                    color: p.place === 1 ? 'var(--accent)' : 'var(--ink-dim)',
                  }}>{p.place === 1 ? '🏆' : `#${p.place}`}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full ranked table */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px 100px',
          padding: '10px 16px', borderBottom: '1px solid var(--line)',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
        }}>
          <span>Rank</span>
          <span>Friend</span>
          <span>Streak</span>
          <span>Level</span>
          <span>XP</span>
        </div>
        {/* Rows */}
        {(profiles ?? []).map((p, idx) => {
          const isMe = p.id === user.id
          return (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 100px 80px 100px',
              padding: '10px 16px', alignItems: 'center',
              background: isMe ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
              borderBottom: idx < (profiles ?? []).length - 1 ? '1px solid var(--line-soft)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink-dim)' }}>#{idx + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {p.avatar_url ? (
                  <Image src={p.avatar_url} alt={p.display_name ?? 'avatar'} width={32} height={32}
                    style={{ borderRadius: '50%', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: 'var(--ink-muted)',
                  }}>{(p.display_name?.[0] ?? '?').toUpperCase()}</div>
                )}
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: isMe ? 700 : 500,
                  color: isMe ? 'var(--accent)' : 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{isMe ? 'You' : (p.display_name ?? 'Mover')}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--flame)' }}>{p.current_streak}d</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>Lv {p.level}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{p.xp.toLocaleString()}</div>
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}
