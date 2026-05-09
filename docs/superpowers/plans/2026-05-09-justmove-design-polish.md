# justMove Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every page of the justMove app visually match the design prototype sourced from the Claude Design bundle (jm-mobile.jsx, jm-ui.jsx, jm-tokens.jsx).

**Architecture:** All pages are Next.js 15 App Router server components (data-fetching) with isolated client components for interactivity. Shared UI primitives live in `components/`. The design uses CSS custom properties already defined in `globals.css` (dark theme default, Bricolage Grotesque / Geist / JetBrains Mono fonts). No new data fetching patterns are introduced — all DB queries already work.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Supabase (postgres + storage), TypeScript. No new packages needed.

**Design reference:** `/tmp/justmove-design/justmove/project/jm-mobile.jsx` — screens: `JMMobileHome`, `JMMobileAdd`, `JMMobileLog`, `JMMobileStreak`, `JMMobileProfile`, `JMMobileLeaderboard`. UI primitives in `jm-ui.jsx`.

**Already done (do NOT redo):**
- `app/globals.css` — missing CSS vars added, `text-rendering`, letter-spacing
- `app/page.tsx` — sign-in page fully redesigned
- `app/sign-in-button.tsx` — dark pill Google button
- `components/nav.tsx` — floating pill tab bar on mobile

---

## File Structure

**Modified:**
- `components/streak-counter.tsx` — big display number + SVG flame, remove emoji
- `components/day-progress.tsx` — split lime/flame progress bar with dashed threshold tick
- `components/xp-bar.tsx` — "Level N" label + xp/max line + bar
- `components/rank-badge.tsx` — shield polygon SVG with tier gradient + roman division + pip dots
- `components/activity-card.tsx` — colored icon chip, XP display, photo thumbnail right
- `components/photo-upload.tsx` — dark gradient camera area placeholder (220px tall)
- `app/(app)/layout.tsx` — increase mobile bottom padding for floating nav
- `app/(app)/home/page.tsx` — hero streak card, XP card with multiplier, 7-day bars, CTA
- `app/(app)/add/page.tsx` — step-by-step layout, 4-col activity grid, minute display + slider
- `app/(app)/log/page.tsx` — "Log" headline + stats, filter chips, redesigned activity rows
- `app/(app)/streak/page.tsx` — hero giant number + stats triple + vertical timeline
- `app/(app)/profile/page.tsx` — gradient header card, shield rank, 2×2 stat grid, achievements, settings strip
- `app/(app)/leaderboard/page.tsx` — "Friends" headline, 3-tab segmented control, podium top 3, list rest

**Created:**
- `components/streak-timeline.tsx` — vertical day-by-day timeline (last 14 days)

---

## Task 1: Shared UI components + layout padding

**Files:**
- Modify: `components/streak-counter.tsx`
- Modify: `components/day-progress.tsx`
- Modify: `components/xp-bar.tsx`
- Modify: `components/rank-badge.tsx`
- Modify: `components/activity-card.tsx`
- Modify: `components/photo-upload.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Update StreakCounter**

Replace `components/streak-counter.tsx` entirely:

```tsx
interface Props {
  streak: number
  size?: 'lg' | 'md' | 'sm'
}

const SIZES = {
  lg: { fs: 88,  iconSize: 28, labelFs: 11 },
  md: { fs: 56,  iconSize: 22, labelFs: 10 },
  sm: { fs: 36,  iconSize: 18, labelFs: 10 },
}

export default function StreakCounter({ streak, size = 'lg' }: Props) {
  const { fs, iconSize, labelFs } = SIZES[size]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: fs,
        fontWeight: 800, lineHeight: 0.9, color: 'var(--ink)', letterSpacing: '-0.04em',
      }}>{streak}</span>
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        paddingBottom: fs * 0.08,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
            stroke="var(--flame)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-4 1 2 3 1 3-4z" />
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: labelFs, color: 'var(--flame)',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>day streak</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update DayProgress**

Replace `components/day-progress.tsx` entirely:

```tsx
interface Props {
  minutesToday: number
  currentStreak: number
}

export default function DayProgress({ minutesToday, currentStreak }: Props) {
  const bonusMins   = Math.max(0, minutesToday - 30)
  const met         = minutesToday >= 30
  const totalMax    = 90
  const baselineAt  = (30 / totalMax) * 100
  const filledPct   = Math.min(100, (minutesToday / totalMax) * 100)
  const bonusPct    = met ? Math.min(100, filledPct) - baselineAt : 0

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
        }}>Today</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
          {minutesToday}<span style={{ color: 'var(--ink-dim)', fontWeight: 400 }}> / 30 min</span>
        </span>
      </div>

      <div style={{
        position: 'relative', height: 10, background: 'var(--surface2)',
        borderRadius: 999, overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${Math.min(baselineAt, filledPct)}%`,
          background: 'var(--accent)', borderRadius: 999,
        }} />
        {bonusPct > 0 && (
          <div style={{
            position: 'absolute', left: `${baselineAt}%`, top: 0, bottom: 0,
            width: `${bonusPct}%`,
            background: 'var(--flame)', borderRadius: '0 999px 999px 0',
          }} />
        )}
        <div style={{
          position: 'absolute', left: `${baselineAt}%`, top: -3, bottom: -3, width: 2,
          background: 'var(--bg)', borderLeft: '1.5px dashed var(--flame)',
        }} />
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 6,
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
      }}>
        <span>baseline 30m</span>
        {bonusMins > 0
          ? <span style={{ color: 'var(--flame)', fontWeight: 700 }}>+{bonusMins}m bonus</span>
          : met
          ? <span style={{ color: 'var(--flame)', fontWeight: 700 }}>streak alive!</span>
          : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update XPBar**

Replace `components/xp-bar.tsx` entirely:

```tsx
import { xpToNextLevel } from '@/lib/game'

interface Props {
  level: number
  xp: number
}

export default function XPBar({ level, xp }: Props) {
  const needed = xpToNextLevel(level)
  const pct    = Math.min(100, (xp / needed) * 100)

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)',
        }}>
          Level <span style={{ color: 'var(--accent)' }}>{level}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)' }}>
          {xp.toLocaleString()}<span style={{ opacity: 0.5 }}> / {needed.toLocaleString()} xp</span>
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'var(--accent)', borderRadius: 999, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update RankBadge to shield polygon**

Replace `components/rank-badge.tsx` entirely:

```tsx
import { getRankInfo } from '@/lib/game'

interface Props {
  level: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function RankBadge({ level, size = 'md', showLabel }: Props) {
  const r        = getRankInfo(level)
  const show     = showLabel ?? size !== 'sm'
  const sz       = size === 'lg'
    ? { box: 64, name: 18, sub: 11, gap: 14 }
    : size === 'sm'
    ? { box: 32, name: 12, sub: 9,  gap: 8  }
    : { box: 44, name: 14, sub: 10, gap: 10 }
  const pipsFilled = r.roman === 'I' ? 3 : r.roman === 'II' ? 2 : 1
  const gradId   = `rg-${r.key}-${size}`

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: sz.gap }}>
      <div style={{
        position: 'relative', width: sz.box, height: sz.box,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width={sz.box} height={sz.box} viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={r.color} stopOpacity="1" />
              <stop offset="1" stopColor={r.color} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <path d="M32 3l24 8v18c0 14-10 25-24 32C18 54 8 43 8 29V11z"
            fill={`url(#${gradId})`} stroke={r.color} strokeWidth="1.2" strokeOpacity="0.9" />
          <path d="M32 3l24 8v18c0 14-10 25-24 32C18 54 8 43 8 29V11z"
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
        </svg>
        <span style={{
          position: 'relative', color: r.ink, fontWeight: 800,
          fontFamily: 'var(--font-display)',
          fontSize: sz.box * 0.34, letterSpacing: '-0.02em', lineHeight: 1,
          textShadow: '0 1px 0 rgba(0,0,0,.15)',
        }}>{r.roman}</span>
      </div>

      {show && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: sz.name, fontWeight: 700,
              color: 'var(--ink)', letterSpacing: '-0.02em',
            }}>{r.name}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: sz.sub, color: r.color,
              fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>{r.roman}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: sz.sub - 2, height: 3, display: 'inline-block',
                background: i < pipsFilled ? r.color : `${r.color}33`,
                borderRadius: 1,
              }} />
            ))}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: sz.sub,
              color: 'var(--ink-dim)', marginLeft: 4,
            }}>L{level}</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Update ActivityCard**

Add activity hue map and redesign the row. Replace `components/activity-card.tsx` entirely:

```tsx
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
```

- [ ] **Step 6: Update PhotoUpload placeholder**

Replace the empty-state area in `components/photo-upload.tsx`. Only the placeholder button changes — keep all upload logic intact. Replace the `{uploading ? ... : <>...</>}` JSX block inside the `<button>`:

```tsx
{uploading ? (
  <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>Uploading…</span>
) : (
  <>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.18)',
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6.5" width="18" height="13" rx="2.4"/>
        <circle cx="12" cy="13" r="3.6"/>
        <path d="M9 6.5l1.5-2h3L15 6.5"/>
      </svg>
    </div>
    <span style={{ fontSize: 14, color: '#fff', opacity: 0.95 }}>Take photo</span>
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10,
      color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>or pick from camera roll</span>
  </>
)}
```

Also update the button style to the dark gradient area:

```tsx
<button
  type="button"
  onClick={() => inputRef.current?.click()}
  disabled={uploading}
  style={{
    width: '100%', height: 220, borderRadius: 18, border: 'none',
    background: 'linear-gradient(180deg, oklch(0.32 0.05 16), oklch(0.18 0.04 16))',
    backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 12px, transparent 12px 24px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 10, cursor: 'pointer', position: 'relative',
    opacity: uploading ? 0.5 : 1,
  }}
>
```

- [ ] **Step 7: Increase mobile bottom padding in app layout**

In `app/(app)/layout.tsx`, change `pb-20` to `pb-32`:

```tsx
<main className="md:pl-60 pb-32 md:pb-0 min-h-screen">
```

- [ ] **Step 8: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add components/streak-counter.tsx components/day-progress.tsx components/xp-bar.tsx \
        components/rank-badge.tsx components/activity-card.tsx components/photo-upload.tsx \
        app/\(app\)/layout.tsx
git commit -m "design: update shared UI components to match design system"
```

---

## Task 2: Home page redesign

**Design reference:** `JMMobileHome` in jm-mobile.jsx (lines 169–262)

**Files:**
- Modify: `app/(app)/home/page.tsx`

**Key changes vs current:**
- Greeting row: mono date label + display first name left, avatar right
- Hero streak card: gradient bg, `StreakCounter` lg, "+XP today" accent badge, split progress bar, multiplier hint
- XP card: `XPBar` + streak boost label
- "This week" section: 7-day vertical bar chart inline (last 7 streak_days)
- CTA button: taller (58px), "Log activity" with + icon

- [ ] **Step 1: Add weekly streak_days query**

In the server component, add a query for the last 7 days alongside the existing queries:

```tsx
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
const weekStart = sevenDaysAgo.toISOString().split('T')[0]

const [{ data: profile }, { data: streakDay }, { data: todayActivities }, { data: weekDays }] =
  await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('streak_days').select('minutes_logged')
      .eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('activities').select('*').eq('user_id', user.id)
      .gte('logged_at', `${today}T00:00:00Z`)
      .order('logged_at', { ascending: false }),
    supabase.from('streak_days').select('date, minutes_logged')
      .eq('user_id', user.id).gte('date', weekStart)
      .order('date', { ascending: true }),
  ])
```

- [ ] **Step 2: Replace home page JSX**

Replace `app/(app)/home/page.tsx` entirely:

```tsx
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
      supabase.from('profiles').select('*').eq('id', user.id).single(),
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
      const { data } = await supabase.storage
        .from('activity-proofs').createSignedUrl(activity.photo_url, 3600)
      return { activity, photoUrl: data?.signedUrl ?? null }
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
            {getGreeting()}, {profile.display_name.split(' ')[0]}
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
            {profile.display_name[0].toUpperCase()}
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
        <DayProgress minutesToday={minutesToday} currentStreak={profile.current_streak} />
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
  const h = new Date().getUTCHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
```

- [ ] **Step 3: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/home/page.tsx
git commit -m "design: redesign home page — hero streak card, week bars, XP boost label"
```

---

## Task 3: Add Activity page redesign

**Design reference:** `JMMobileAdd` in jm-mobile.jsx (lines 265–406)

**Files:**
- Modify: `app/(app)/add/page.tsx`
- Modify: `components/photo-upload.tsx` (already updated in Task 1 — no additional changes)

**Key changes vs current:**
- Sheet-style header: "← Cancel" link / "New activity" title
- Step labels: "1 — proof photo", "2 — activity", "3 — minutes"
- Activity grid: 4 columns (not 3), square aspect-ratio tiles, colored icon per type
- Minutes: large 64px display number, quick preset buttons [15, 30, 45, 60, 90], slider rail with flame marker at 30m, XP boost callout
- CTA: "Lock it in" (not "Save activity"), 58px tall

- [ ] **Step 1: Replace add page**

Replace `app/(app)/add/page.tsx` entirely:

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

  const xpBoost   = minutes > 30 ? calculateXP(minutes, 0) - 30 : 0
  const sliderPct = Math.min(100, (minutes / 90) * 100)
  const baselineAt = (30 / 90) * 100

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22,
      }}>
        <Link href="/home" style={{ fontSize: 15, color: 'var(--ink-dim)', textDecoration: 'none' }}>
          ← Cancel
        </Link>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
          New activity
        </span>
        <span style={{ fontSize: 15, color: 'var(--ink-dim)', opacity: 0.4 }}>Save</span>
      </div>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Step 1: Photo */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>1 — proof photo</div>
          <PhotoUpload onUpload={setPhoto} />
          <input type="hidden" name="photo_url" value={photoPath} />
        </div>

        {/* Step 2: Activity */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>2 — activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {ACTIVITY_TYPES.slice(0, 8).map(type => {
              const active = selectedType === type
              const hue    = HUES[type]
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setType(type)}
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
          <input type="hidden" name="type" value={selectedType ?? ''} />
        </div>

        {/* Step 3: Minutes */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>3 — minutes</span>
            {xpBoost > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>
                +{xpBoost}xp boost
              </span>
            )}
          </div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 18,
          }}>
            {/* Big number */}
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
            {/* Quick buttons */}
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
            {/* Slider */}
            <div style={{ position: 'relative', height: 6, background: 'var(--surface2)', borderRadius: 999 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${sliderPct}%`, background: 'var(--accent)', borderRadius: 999,
              }} />
              {/* baseline marker */}
              <div style={{
                position: 'absolute', left: `${baselineAt}%`, top: -3, bottom: -3, width: 2,
                background: 'var(--flame)', borderRadius: 1,
              }} />
              {/* thumb */}
              <div style={{
                position: 'absolute', left: `calc(${sliderPct}% - 10px)`,
                top: -7, width: 20, height: 20, borderRadius: '50%',
                background: 'var(--ink)', border: '3px solid var(--accent)',
                cursor: 'pointer',
              }} />
              <input
                type="range" min="1" max="90" value={minutes}
                onChange={e => setMinutes(parseInt(e.target.value, 10))}
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
          <input type="hidden" name="duration_minutes" value={minutes} />
        </div>

        {state?.error && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 12,
            background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)',
          }}>{state.error}</p>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={pending || !selectedType || !photoPath}
          style={{
            width: '100%', height: 58, borderRadius: 16, border: 'none',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: pending || !selectedType || !photoPath ? 0.4 : 1,
            marginBottom: 8,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
          {pending ? 'Saving…' : 'Lock it in'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/add/page.tsx
git commit -m "design: redesign add activity page — step labels, 4-col grid, minute slider"
```

---

## Task 4: Activity Log page redesign

**Design reference:** `JMMobileLog` in jm-mobile.jsx (lines 409–460)

**Files:**
- Modify: `app/(app)/log/page.tsx`

**Key changes vs current:**
- "Log" headline (32px display) + mono stats subtitle
- Horizontal scrollable filter chips (All, Run, Walk, Gym, Cycle, Yoga)
- Date group headers in mono uppercase
- Activities in a card (`var(--surface)` bg + border) per group, using updated `ActivityCard`

- [ ] **Step 1: Replace log page**

Replace `app/(app)/log/page.tsx` entirely:

```tsx
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
      const { data } = await supabase.storage
        .from('activity-proofs').createSignedUrl(activity.photo_url, 3600)
      return { activity, photoUrl: data?.signedUrl ?? null }
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
              {items.map(({ activity, photoUrl }, i) => (
                <div key={activity.id} style={{
                  borderBottom: i === items.length - 1 ? 'none' : undefined,
                }}>
                  <ActivityCard activity={activity} photoUrl={photoUrl} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/log/page.tsx
git commit -m "design: redesign activity log — headline, filter chips, grouped card layout"
```

---

## Task 5: Streak page redesign

**Design reference:** `JMMobileStreak` in jm-mobile.jsx (lines 463–526)

**Files:**
- Modify: `app/(app)/streak/page.tsx`
- Create: `components/streak-timeline.tsx`

**Key changes vs current:**
- Hero: "current streak" mono label, giant number (120px), SVG flame icon
- Stats triple grid: Best ever / Days moved / Days in DB
- Vertical day-by-day timeline for last 14 days (replaces calendar grid)

- [ ] **Step 1: Create streak timeline component**

Create `components/streak-timeline.tsx`:

```tsx
interface Day {
  date: string
  minutes_logged: number
}

interface Props {
  days: Day[]
}

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StreakTimeline({ days }: Props) {
  const today = new Date().toISOString().split('T')[0]

  // Last 14 days newest-first
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const entry = days.find(x => x.date === date)
    const isToday = date === today
    return {
      date, mins: entry?.minutes_logged ?? 0, isToday,
      dayLabel: isToday ? 'Today' : i === 1 ? 'Yesterday'
        : DAY_LABELS[(d.getDay() + 6) % 7],
      dateLabel: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    }
  })

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 18, padding: 16,
    }}>
      {last14.map((d, i) => {
        const ok     = d.mins >= 30
        const isLast = i === last14.length - 1
        return (
          <div key={d.date} style={{ display: 'flex', gap: 14, position: 'relative' }}>
            {/* Rail */}
            <div style={{
              width: 28, position: 'relative', flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 7, marginTop: 6,
                background: ok ? 'var(--accent)' : 'var(--surface2)',
                border: ok ? 'none' : '2px solid var(--line)',
                outline: d.isToday ? '3px solid var(--flame)' : 'none',
                outlineOffset: 2, position: 'relative', zIndex: 2, flexShrink: 0,
              }} />
              {!isLast && (
                <div style={{ flex: 1, width: 2, background: 'var(--line)', marginTop: -1 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                }}>{d.dayLabel}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{d.dateLabel}</span>
                {d.isToday && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px',
                    background: 'var(--flame-soft)', color: 'var(--flame)',
                    borderRadius: 999, fontSize: 9, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>live</span>
                )}
              </div>
              {d.mins > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                    color: ok ? 'var(--ink)' : 'var(--danger)',
                  }}>{d.mins}m</span>
                  {ok && d.mins > 30 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: 'var(--accent)', fontWeight: 700,
                    }}>+{(d.mins - 30)}m bonus</span>
                  )}
                </div>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-dim)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>rest day</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Replace streak page**

Replace `app/(app)/streak/page.tsx` entirely:

```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakTimeline from '@/components/streak-timeline'

export default async function StreakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const fourteenAgo = new Date(); fourteenAgo.setDate(fourteenAgo.getDate() - 13)
  const ninetyAgo   = new Date(); ninetyAgo.setDate(ninetyAgo.getDate() - 90)

  const [{ data: profile }, { data: streakDays }, { data: allDays }] = await Promise.all([
    supabase.from('profiles')
      .select('current_streak, best_streak, total_minutes')
      .eq('id', user.id).single(),
    supabase.from('streak_days')
      .select('date, minutes_logged')
      .eq('user_id', user.id)
      .gte('date', fourteenAgo.toISOString().split('T')[0])
      .order('date', { ascending: false }),
    supabase.from('streak_days')
      .select('date', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('minutes_logged', 30),
  ])

  if (!profile) redirect('/')

  const daysMoved = allDays?.length ?? 0

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
          { val: profile.best_streak, lab: 'Best ever' },
          { val: daysMoved,            lab: 'Days moved' },
          { val: Math.round(profile.total_minutes / 60), lab: 'Hours total' },
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
```

- [ ] **Step 3: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/streak/page.tsx components/streak-timeline.tsx
git commit -m "design: redesign streak page — hero number, stats triple, vertical timeline"
```

---

## Task 6: Profile page redesign

**Design reference:** `JMMobileProfile` in jm-mobile.jsx (lines 529–635)

**Files:**
- Modify: `app/(app)/profile/page.tsx`
- Modify: `app/(app)/profile/edit-name-form.tsx`

**Key changes vs current:**
- Header card: `oklch(0.34 0.06 90) → var(--surface)` gradient, settings icon top-right, 68px avatar
- Shield rank badge (already handled by updated RankBadge), tier progress bar
- 2×2 stat grid: current streak (flame color), best streak (accent), activities, XP
- Achievements grid 4×4 (locked = dimmed, accent icon chip)
- Settings strip: Notifications / Privacy / Export / Sign out rows (first three non-functional)

- [ ] **Step 1: Add total activities count query**

In the profile server component, add a count query for total activities:

```tsx
const [{ data: profile }, { count: activityCount }] = await Promise.all([
  supabase.from('profiles').select('*').eq('id', user.id).single(),
  supabase.from('activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
])
```

- [ ] **Step 2: Replace profile page**

Replace `app/(app)/profile/page.tsx` entirely:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RankBadge from '@/components/rank-badge'
import XPBar from '@/components/xp-bar'
import EditNameForm from './edit-name-form'
import { getRankInfo, xpToNextLevel } from '@/lib/game'
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
    medal: <><circle cx="12" cy="14" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M9 8L7 3h10L15 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
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
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (!profile) redirect('/')

  const rank      = getRankInfo(profile.level)
  const tierPct   = Math.min(1, rank.levelInTier / rank.tierSize)

  async function signOut() {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>

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
            }}>{profile.display_name[0].toUpperCase()}</div>
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
          { lab: 'Notifications', val: 'On',      action: null   },
          { lab: 'Privacy',       val: 'Friends',  action: null   },
          { lab: 'Export data',   val: '',         action: null   },
        ].map((row, i) => (
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
  )
}
```

- [ ] **Step 3: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/profile/page.tsx
git commit -m "design: redesign profile — gradient header, rank shield, 2x2 stats, achievements"
```

---

## Task 7: Leaderboard page redesign

**Design reference:** `JMMobileLeaderboard` in jm-mobile.jsx (lines 638–733)

**Files:**
- Modify: `app/(app)/leaderboard/page.tsx`

**Key changes vs current:**
- "Friends" headline (32px), "weekly streak board" mono subtitle
- 3-tab segmented control: Streak / XP / Minutes (add `total_minutes` sort)
- Podium: top 3 as columns with varying bar heights (1st=130, 2nd=105, 3rd=95px)
- List: rows 4+ with rank number, avatar, name/stats, value

- [ ] **Step 1: Replace leaderboard page**

Replace `app/(app)/leaderboard/page.tsx` entirely:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import RankBadge from '@/components/rank-badge'

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

  function getValue(p: typeof top3[0]) {
    if (sort === 'xp')      return `${p.xp.toLocaleString()} XP`
    if (sort === 'minutes') return `${p.total_minutes.toLocaleString()}m`
    return `${p.current_streak}d`
  }

  // Podium order: 2nd left, 1st center, 3rd right
  const podium = top3.length >= 3
    ? [{ ...top3[1], place: 2 }, { ...top3[0], place: 1 }, { ...top3[2], place: 3 }]
    : top3.map((p, i) => ({ ...p, place: i + 1 }))

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
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
                }}>{p.display_name[0].toUpperCase()}</div>
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
                }}>{p.display_name[0].toUpperCase()}</div>
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
  )
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/jaqubm/Developer/justMove && npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/leaderboard/page.tsx
git commit -m "design: redesign leaderboard — friends headline, podium, 3-tab segmented control"
```

---

## Final: push to Vercel

- [ ] **Push all commits**

```bash
git push origin main
```

Vercel will auto-deploy from `main`. Verify each page visually at `https://justmove.jaqubm.dev`.
