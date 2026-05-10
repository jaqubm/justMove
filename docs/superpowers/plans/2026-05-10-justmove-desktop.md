# justMove Desktop Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add responsive desktop layouts to all 7 justMove pages so the app looks polished on `md:` breakpoint (768px+) instead of showing a narrow mobile column.

**Architecture:** The sidebar nav already exists (`components/nav.tsx`) with `md:pl-60` body padding. Each page adds a `<div className="hidden md:block">` desktop section alongside the wrapped `<div className="md:hidden">` mobile section. No routing changes — same URL, same data, two layout branches.

**Tech Stack:** Next.js 15 App Router, React, Tailwind v4, Supabase (server client), inline CSS custom properties (`var(--bg)`, `var(--accent)`, etc.), fonts `var(--font-display)` / `var(--font-mono)` / `var(--font-sans)`.

---

## File Structure

- **Modify:** `app/page.tsx` — sign-in page, add desktop split layout
- **Modify:** `app/sign-in-button.tsx` — add `inline?: boolean` prop for auto-width variant
- **Modify:** `app/(app)/home/page.tsx` — add friends query + 3-col/2-col desktop grid
- **Modify:** `app/(app)/add/page.tsx` — add 2-col photo+form desktop layout
- **Modify:** `app/(app)/log/page.tsx` — add profile query + 4 stat tiles + table
- **Modify:** `app/(app)/streak/page.tsx` — add 2-col layout + milestones section
- **Modify:** `app/(app)/profile/page.tsx` — 96px avatar, 4-col stats, 6-col achievements
- **Modify:** `app/(app)/leaderboard/page.tsx` — gradient podium card + full table

---

### Task 1: Desktop sign-in page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/sign-in-button.tsx`

- [ ] **Step 1: Add `inline` prop to SignInButton**

Replace `app/sign-in-button.tsx` with:

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function SignInButton({ inline }: { inline?: boolean }) {
  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      style={{
        width: inline ? 'auto' : '100%',
        height: 60, borderRadius: 9999,
        padding: inline ? '0 32px' : undefined,
        background: 'var(--ink)', color: 'var(--bg)', border: 'none',
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        cursor: 'pointer', letterSpacing: '-0.01em',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.13 4.13 0 01-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z" fill="#4285f4"/>
        <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.96v2.34A8.99 8.99 0 009 18z" fill="#34a853"/>
        <path d="M3.93 10.68A5.4 5.4 0 013.64 9c0-.58.1-1.15.29-1.68V4.98H.96A8.99 8.99 0 000 9c0 1.45.35 2.83.96 4.02l2.97-2.34z" fill="#fbbc05"/>
        <path d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.42 0 9 0A8.99 8.99 0 00.96 4.98l2.97 2.34C4.64 5.18 6.64 3.58 9 3.58z" fill="#ea4335"/>
      </svg>
      Continue with Google
    </button>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors (or only pre-existing errors unrelated to this change)

- [ ] **Step 3: Add desktop layout to `app/page.tsx`**

In `app/page.tsx`, wrap the existing `<main>` content in `<div className="md:hidden">` and add a new desktop section. The full page should look like:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignInButton from './sign-in-button'

export default async function SignInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <>
      {/* ── Mobile ── */}
      <div className="md:hidden">
        <main style={{
          minHeight: '100dvh', position: 'relative', overflow: 'hidden',
          background: `radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, var(--bg) 60%), var(--bg)`,
          color: 'var(--ink)',
        }}>
          {/* accent halo */}
          <div style={{
            position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 70%)',
            filter: 'blur(8px)', pointerEvents: 'none',
          }} />

          <div style={{ padding: '120px 24px 0', position: 'relative' }}>
            {/* logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 80 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="var(--accent-ink)" stroke="none" />
                </svg>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                letterSpacing: '-0.04em', color: 'var(--ink)',
              }}>justMove</span>
            </div>

            {/* headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 14vw, 56px)',
              fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.05em',
              color: 'var(--ink)', marginBottom: 18,
            }}>
              Show up.<br />
              <span style={{ color: 'var(--accent)' }}>Move.</span><br />
              Repeat.
            </h1>

            <p style={{ fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1.45, maxWidth: 280 }}>
              30 minutes a day keeps the streak alive. Photo-proof your sweat. Level up the human.
            </p>
          </div>

          {/* bottom CTA */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '0 24px 48px' }}>
            <SignInButton />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>By continuing you agree to</span>
              <span style={{ fontSize: 12, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}>terms</span>
              <span style={{ fontSize: 12, color: 'var(--ink-dim)' }}>·</span>
              <span style={{ fontSize: 12, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 2 }}>privacy</span>
            </div>
          </div>
        </main>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:flex" style={{
        minHeight: '100dvh', background: 'var(--bg)', color: 'var(--ink)',
      }}>
        {/* Left panel */}
        <div style={{
          flex: '1.1', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 72px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="var(--accent-ink)" stroke="none" />
              </svg>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800,
              letterSpacing: '-0.04em', color: 'var(--ink)',
            }}>justMove</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 800,
            lineHeight: 0.9, letterSpacing: '-0.05em', color: 'var(--ink)',
            marginBottom: 24,
          }}>
            Show up.<br />
            <span style={{ color: 'var(--accent)' }}>Move.</span><br />
            Repeat.
          </h1>

          <p style={{
            fontSize: 18, color: 'var(--ink-muted)', lineHeight: 1.5,
            maxWidth: 360, marginBottom: 40,
          }}>
            30 minutes a day keeps the streak alive. Photo-proof your sweat. Level up the human.
          </p>

          <div style={{ marginBottom: 40 }}>
            <SignInButton inline />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { val: '187k', lab: 'movers' },
              { val: '4.2M', lab: 'minutes logged' },
              { val: '28d',  lab: 'avg streak' },
            ].map(s => (
              <div key={s.lab}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800,
                  color: 'var(--ink)', letterSpacing: '-0.03em',
                }}>{s.val}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{s.lab}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — decorative */}
        <div style={{
          flex: '0.9', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg, oklch(0.26 0.06 90) 0%, var(--bg) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Big decorative number */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 260, fontWeight: 800,
            lineHeight: 1, letterSpacing: '-0.06em',
            color: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            userSelect: 'none', pointerEvents: 'none',
            position: 'absolute',
          }}>30</div>

          {/* Floating activity cards */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, padding: 40 }}>
            {[
              { type: 'Run', mins: 42, xp: '+42xp', hue: 16 },
              { type: 'Yoga', mins: 35, xp: '+35xp', hue: 320 },
            ].map(card => (
              <div key={card.type} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 18, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14, minWidth: 260,
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `oklch(0.26 0.08 ${card.hue})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: `oklch(0.78 0.16 ${card.hue})`, textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>{card.type[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>{card.type}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>{card.mins}m today</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                }}>{card.xp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/sign-in-button.tsx
git commit -m "feat: add desktop split layout to sign-in page"
```

---

### Task 2: Desktop home page

**Files:**
- Modify: `app/(app)/home/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Add friends query and desktop layout**

The current home page fetches profile, streakDay, todayActivities, weekDays in a `Promise.all`. Add a friends query as the 5th item.

Find the existing `Promise.all` block and replace it:

```tsx
const [{ data: profile }, { data: streakDay }, { data: todayActivities }, { data: weekDays }, { data: friends }] =
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
    supabase.from('profiles')
      .select('id, display_name, avatar_url, level, current_streak')
      .neq('id', user.id)
      .order('current_streak', { ascending: false })
      .limit(5),
  ])
```

- [ ] **Step 3: Wrap existing mobile return in `md:hidden` and add desktop section**

The existing `return (` starts with `<div style={{ maxWidth: 560, ...`. Wrap the entire existing return content in `<div className="md:hidden">` and add the desktop section after. The desktop section structure:

```tsx
return (
  <>
    {/* ── Mobile ── */}
    <div className="md:hidden">
      {/* ... existing mobile JSX unchanged ... */}
    </div>

    {/* ── Desktop ── */}
    <div className="hidden md:block" style={{ padding: '28px 36px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
            color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{getGreeting()} back,</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--ink)',
          }}>{profile.display_name?.split(' ')[0] || 'Mover'}</div>
        </div>
        <Link href="/add" style={{
          height: 44, padding: '0 22px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: 'var(--accent-ink)',
          fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log activity
        </Link>
      </div>

      {/* Top row: 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Streak hero card */}
        <div style={{
          background: 'linear-gradient(160deg, color-mix(in srgb, var(--accent) 14%, var(--surface)), var(--surface))',
          border: '1px solid var(--line)', borderRadius: 22, padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <StreakCounter streak={profile.current_streak} size="lg" />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Today</div>
          </div>
          <DayProgress minutes={minutesToday} />
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
            +{todayXP} XP today
          </div>
        </div>

        {/* Level / rank card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 22, padding: '22px 24px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12,
          }}>Rank</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <RankBadge level={profile.level} size="md" />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
                Level {profile.level}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', letterSpacing: '0.04em' }}>
                ×{multiplier} multiplier
              </div>
            </div>
          </div>
          <XPBar xp={profile.xp} max={xpNeeded} level={profile.level} />
        </div>

        {/* Week card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 22, padding: '22px 24px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
          }}>This week</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800,
            letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 12,
          }}>{weekMinutes}m</div>
          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 48 }}>
            {weekBars.map(bar => (
              <div key={bar.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  width: '100%', borderRadius: 4, minHeight: 2,
                  height: Math.max(2, (bar.mins / barMax) * 40),
                  background: bar.mins >= 30 ? 'var(--accent)' : 'var(--surface2)',
                }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-dim)' }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Recent activities */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 22, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Today&apos;s activities</div>
            <Link href="/log" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {activitiesWithUrls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)' }}>
              No activities yet today
            </div>
          ) : (
            activitiesWithUrls.slice(0, 4).map(({ activity, photoUrl }) => (
              <ActivityCard key={activity.id} activity={activity} photoUrl={photoUrl} />
            ))
          )}
        </div>

        {/* Friends mini-leaderboard */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 22, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>Streak leaders</div>
            <Link href="/leaderboard" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', textDecoration: 'none' }}>
              Full board →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(friends ?? []).map((f, i) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  width: 16, textAlign: 'center', flexShrink: 0,
                }}>{i + 1}</div>
                {f.avatar_url ? (
                  <Image src={f.avatar_url} alt={f.display_name} width={32} height={32}
                    style={{ borderRadius: '50%', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink-muted)',
                  }}>{(f.display_name?.[0] ?? '?').toUpperCase()}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{f.display_name ?? 'Mover'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)' }}>
                    Lv {f.level}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color: 'var(--flame)', flexShrink: 0,
                }}>{f.current_streak}🔥</div>
              </div>
            ))}
            {(friends ?? []).length === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)', textAlign: 'center', padding: '16px 0' }}>
                Be the first to move!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)
```

Note: `getGreeting` is already defined in this file. `Image` import is already present. All component imports (`StreakCounter`, `DayProgress`, `ActivityCard`, `RankBadge`, `XPBar`) are already imported.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/home/page.tsx
git commit -m "feat: add desktop 3-col/2-col layout to home page"
```

---

### Task 3: Desktop add activity page

**Files:**
- Modify: `app/(app)/add/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Add desktop layout**

`app/(app)/add/page.tsx` is a client component. The existing content starts at `<div style={{ maxWidth: 560, ...`. Wrap the existing return JSX in `<div className="md:hidden">` and add a `<div className="hidden md:flex">` desktop section inside the same `<form>` — actually, since the form wraps most of the content, the approach is:

1. Extract the `<form>` so both mobile and desktop share the same `<form>` element
2. Or: keep two separate forms (both call `action`)

**Recommended:** Keep two complete forms (one mobile, one desktop). Both call `action` and both share the same state variables. This avoids complex form-element sharing.

The full updated file:

```tsx
'use client'
import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logActivity } from '@/app/actions/activity'
import PhotoUpload from '@/components/photo-upload'
import ActivityGlyph from '@/components/activity-glyph'
import { ACTIVITY_LABELS, type ActivityType } from '@/lib/types'
import { calculateXP } from '@/lib/game'

const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABELS) as ActivityType[]

const HUES: Record<ActivityType, number> = {
  walk: 130, run: 16, cycle: 200, gym: 280, yoga: 320,
  sport: 50, dance: 340, hike: 100, move: 70,
}

const QUICK_MINS = [15, 30, 45, 60, 90]

export default function AddActivityPage() {
  const router                   = useRouter()
  const [state, action, pending] = useActionState(logActivity, null)
  const [selectedType, setType]  = useState<ActivityType | null>(null)
  const [photoPath, setPhoto]    = useState('')
  const [minutes, setMinutes]    = useState(30)

  useEffect(() => {
    if (state?.result) router.push('/home')
  }, [state?.result, router])

  const xpBoost    = minutes > 30 ? calculateXP(minutes, 0) - 30 : 0
  const sliderPct  = Math.min(100, (minutes / 90) * 100)
  const baselineAt = (30 / 90) * 100

  const activityGrid = (cols: number) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {ACTIVITY_TYPES.slice(0, 9).map(type => {
        const active = selectedType === type
        const hue    = HUES[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => setType(type)}
            aria-label={`Select ${ACTIVITY_LABELS[type]}`}
            style={{
              aspectRatio: '1', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: active ? 'var(--accent)' : 'var(--surface)',
              outline: active ? 'none' : '1px solid var(--line)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, fontFamily: 'inherit',
              color: active ? 'var(--accent-ink)' : 'var(--ink)',
            }}
          >
            <ActivityGlyph
              type={type} size={22}
              color={active ? 'var(--accent-ink)' : `oklch(0.78 0.16 ${hue})`}
            />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>{ACTIVITY_LABELS[type]}</span>
          </button>
        )
      })}
    </div>
  )

  const minutesWidget = (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 800,
          letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 0.9,
        }}>{minutes}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>min</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {QUICK_MINS.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            style={{
              flex: 1, height: 32, borderRadius: 8, border: '1px solid var(--line)',
              background: m === minutes ? 'var(--surface2)' : 'transparent',
              color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 11,
              fontWeight: 700, cursor: 'pointer',
            }}
          >{m}</button>
        ))}
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--surface2)', borderRadius: 999 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${sliderPct}%`, background: 'var(--accent)', borderRadius: 999,
        }} />
        <div style={{
          position: 'absolute', left: `${baselineAt}%`, top: -3, bottom: -3, width: 2,
          background: 'var(--flame)', borderRadius: 1,
        }} />
        <div style={{
          position: 'absolute', left: `calc(${sliderPct}% - 10px)`,
          top: -7, width: 20, height: 20, borderRadius: '50%',
          background: 'var(--ink)', border: '3px solid var(--accent)',
          cursor: 'pointer',
        }} />
        <input
          type="range" min="1" max="90" value={minutes}
          onChange={e => setMinutes(parseInt(e.target.value, 10))}
          aria-label="Duration in minutes"
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
      }}>
        <span>0m</span>
        <span style={{ color: 'var(--flame)' }}>30m baseline</span>
        <span>90m</span>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile ── */}
      <div className="md:hidden">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <Link href="/home" style={{ fontSize: 15, color: 'var(--ink-dim)', textDecoration: 'none' }}>← Cancel</Link>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>New activity</span>
            <span style={{ fontSize: 15, color: 'var(--ink-dim)', opacity: 0.4 }}>Save</span>
          </div>
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>1 — proof photo</div>
              <PhotoUpload onUpload={setPhoto} />
              <input type="hidden" name="photo_url" value={photoPath} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>2 — activity</div>
              {activityGrid(4)}
              <input type="hidden" name="type" value={selectedType ?? ''} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>3 — minutes</span>
                {xpBoost > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>+{xpBoost}xp boost</span>
                )}
              </div>
              {minutesWidget}
              <input type="hidden" name="duration_minutes" value={minutes} />
            </div>
            {state?.error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending || !selectedType || !photoPath}
              style={{
                width: '100%', height: 58, borderRadius: 16, border: 'none',
                background: 'var(--accent)', color: 'var(--accent-ink)',
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: pending || !selectedType || !photoPath ? 0.4 : 1, marginBottom: 8,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              {pending ? 'Saving…' : 'Lock it in'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block" style={{ padding: '28px 36px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>New activity</h1>
            <Link href="/home" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', textDecoration: 'none' }}>← Cancel</Link>
          </div>
          <form action={action}>
            <input type="hidden" name="photo_url" value={photoPath} />
            <input type="hidden" name="type" value={selectedType ?? ''} />
            <input type="hidden" name="duration_minutes" value={minutes} />
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'start' }}>
              {/* Left: photo */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Proof photo</div>
                <div style={{ height: 360 }}>
                  <PhotoUpload onUpload={setPhoto} />
                </div>
              </div>
              {/* Right: activity + minutes + submit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Activity type</div>
                  {activityGrid(3)}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</span>
                    {xpBoost > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>+{xpBoost}xp boost</span>
                    )}
                  </div>
                  {minutesWidget}
                </div>
                {state?.error && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)', margin: 0 }}>{state.error}</p>
                )}
                <button
                  type="submit"
                  disabled={pending || !selectedType || !photoPath}
                  style={{
                    width: '100%', height: 56, borderRadius: 14, border: 'none',
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: pending || !selectedType || !photoPath ? 0.4 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  {pending ? 'Saving…' : 'Lock it in'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/add/page.tsx
git commit -m "feat: add desktop 2-col layout to add activity page"
```

---

### Task 4: Desktop activity log

**Files:**
- Modify: `app/(app)/log/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Add profile query for stat tiles**

Currently `log/page.tsx` only fetches activities. Add a parallel profile query to get `current_streak` and `xp`:

Add after the existing imports:

```tsx
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
  // ... rest of existing logic unchanged
```

- [ ] **Step 3: Wrap mobile and add desktop section**

Wrap existing `return (` JSX in `<div className="md:hidden">` and add desktop section. The desktop layout:

```tsx
return (
  <>
    {/* ── Mobile ── */}
    <div className="md:hidden">
      {/* ... existing mobile JSX unchanged ... */}
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
                padding: '10px 16px', alignItems: 'center', gap: 0,
                borderBottom: idx < activitiesWithUrls.length - 1 ? '1px solid var(--line-soft)' : 'none',
              }}>
                {/* Proof thumbnail */}
                <div>
                  {photoUrl ? (
                    <Image src={photoUrl} alt="proof" width={40} height={40}
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
```

Note: Add `import { calculateXP } from '@/lib/game'` and `import Image from 'next/image'` to the imports at the top of the file. Also ensure `'--line-soft'` CSS variable is used correctly.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/log/page.tsx
git commit -m "feat: add desktop stat tiles and table layout to log page"
```

---

### Task 5: Desktop streak page

**Files:**
- Modify: `app/(app)/streak/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Wrap mobile and add desktop layout**

The desktop layout is a 2-col grid: left has the hero number, 3 stat tiles, and milestone progress bars; right has the StreakTimeline inside a card.

```tsx
return (
  <>
    {/* ── Mobile ── */}
    <div className="md:hidden">
      {/* ... existing mobile JSX unchanged ... */}
    </div>

    {/* ── Desktop ── */}
    <div className="hidden md:block" style={{ padding: '28px 36px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>Streak</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left column */}
        <div>
          {/* Hero number */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 22, padding: '32px 36px', marginBottom: 16,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--flame)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Current streak</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 120, fontWeight: 800,
                lineHeight: 0.9, letterSpacing: '-0.06em', color: 'var(--ink)',
              }}>{profile.current_streak}</span>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                stroke="var(--flame)" strokeWidth="2.2" strokeLinecap="round"
                style={{ marginTop: 8, marginLeft: 4 }}>
                <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-4 1 2 3 1 3-4z" />
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DAYS</div>
          </div>

          {/* 3 stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { val: profile.best_streak, lab: 'Best ever' },
              { val: daysMoved ?? 0, lab: 'Days moved' },
              { val: Math.round((profile.total_minutes ?? 0) / 60), lab: 'Hours total' },
            ].map(s => (
              <div key={s.lab} style={{
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 14, padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.lab}</div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 18, padding: '18px 20px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Next milestones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[30, 60, 100].map(target => {
                const pct = Math.min(1, profile.current_streak / target)
                const done = profile.current_streak >= target
                return (
                  <div key={target}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: done ? 'var(--accent)' : 'var(--ink)' }}>
                        {done ? '✓ ' : ''}{target}-day streak
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
                        {done ? 'achieved' : `${profile.current_streak}/${target}`}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 999 }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        width: `${pct * 100}%`,
                        background: done ? 'var(--accent)' : 'var(--flame)',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column — timeline card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 22, padding: '22px 20px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Last 14 days</div>
          <StreakTimeline days={streakDays ?? []} />
        </div>
      </div>
    </div>
  </>
)
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/streak/page.tsx
git commit -m "feat: add desktop 2-col layout with milestones to streak page"
```

---

### Task 6: Desktop profile page

**Files:**
- Modify: `app/(app)/profile/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Add desktop layout**

The desktop profile uses a wider header card (96px avatar vs 68px mobile), 4-col stat grid, and 6-col achievements grid.

Wrap the existing `return (` in `<div className="md:hidden">` and add desktop section:

```tsx
return (
  <>
    {/* ── Mobile ── */}
    <div className="md:hidden">
      {/* ... existing mobile JSX unchanged ... */}
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
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 4 }}>
              {profile.display_name ?? 'Mover'}
            </div>
            <EditNameForm currentName={profile.display_name ?? ''} />
          </div>
          {/* Rank badge + XP bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
            <RankBadge level={profile.level} size="lg" />
            <div style={{ width: 200 }}>
              <XPBar xp={profile.xp} max={xpNeeded} level={profile.level} />
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
  </>
)
```

Note: `EditNameForm` is already imported. `ACHIEVEMENTS`, `AchievementIcon`, `RankBadge`, `XPBar`, `Image`, `getRankInfo`, `rank`, `tierPct`, `xpNeeded` are all already in scope in the existing file.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/profile/page.tsx
git commit -m "feat: add desktop wide layout with 4-col stats and 6-col achievements to profile page"
```

---

### Task 7: Desktop leaderboard

**Files:**
- Modify: `app/(app)/leaderboard/page.tsx`

- [ ] **Step 1: Verify TypeScript baseline**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no errors

- [ ] **Step 2: Wrap mobile and add desktop layout**

The desktop leaderboard has a prominent gradient podium card with height-differentiated columns, then a full ranked table below.

```tsx
return (
  <>
    {/* ── Mobile ── */}
    <div className="md:hidden">
      {/* ... existing mobile JSX unchanged ... */}
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
              height: 36, padding: '0 18px', borderRadius: 9, border: 'none',
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
                  <Image src={p.avatar_url} alt={p.display_name ?? ''} width={56} height={56}
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
                  <Image src={p.avatar_url} alt={p.display_name ?? ''} width={32} height={32}
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
```

Note: `user` is already in scope from `supabase.auth.getUser()`, `TABS`, `sort`, `podium`, `profiles`, `top3`, `getValue` are all already defined in the existing file.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd /Users/jaqubm/Developer/justMove && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/leaderboard/page.tsx
git commit -m "feat: add desktop gradient podium and table layout to leaderboard page"
```

---

## Self-Review

**Spec coverage:**
- ✅ Sign-in: split left/right, inline Google button, stats row, decorative right panel
- ✅ Home: 3-col hero grid + 2-col activities/friends + friends query
- ✅ Add: 2-col photo+form, shared `activityGrid()` helper, shared `minutesWidget`
- ✅ Log: 4 stat tiles, filter row, table with PROOF/ACTIVITY/WHEN/MINUTES/XP/NOTE + profile query
- ✅ Streak: 2-col, hero number, 3 stat tiles, milestone progress bars, timeline card
- ✅ Profile: 96px avatar, 4-col stats, 6-col achievements, sign-out in header row
- ✅ Leaderboard: gradient podium (2nd/1st/3rd column order), full ranked table (RANK/FRIEND/STREAK/LEVEL/XP)

**Placeholder scan:** No TBD, no TODO, no placeholder steps — all code provided in full.

**Type consistency:**
- `friends` query returns `{ id, display_name, avatar_url, level, current_streak }[]` — used consistently in Task 2
- `profile?.current_streak` / `profile?.xp` guarded with `?? 0` in Task 4 since it may be null
- `calculateXP` imported from `@/lib/game` in Task 4 (needs import addition noted in step)
- `Image` imported from `next/image` in Task 4 (needs import addition noted in step)
- `sort === tab.key` comparison in Task 7 is string equality, consistent with existing `sort` variable type
