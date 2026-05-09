# justMove — Design Spec
_2026-05-09_

## Overview

justMove is a web app that gamifies everyday physical movement. Users log daily activities, maintain streaks, earn XP, level up, and progress through a rank ladder. Proof photos are required per activity. Available on both mobile and desktop.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Supabase Auth — Google OAuth2 |
| Database | Supabase Postgres |
| File storage | Supabase Storage (activity proof photos) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Deployment | Vercel Hobby (free) |

---

## Screens

1. **Sign-in** — Google OAuth button, justMove branding
2. **Today / Home** — current streak counter, daily progress bar (30 min baseline + flame-coloured bonus segment for minutes above 30), quick-add button
3. **Add Activity** — activity type picker (Walk, Run, Cycling, Gym, Yoga, Sports, Dance, Hike, Move), duration input, proof photo upload
4. **Activity Log** — scrollable history of past activities with type, duration, thumbnail, date
5. **Streak Calendar** — vertical timeline / calendar view; each day coloured by completion status
6. **Profile** — display name (editable), avatar (from Google, non-editable), level, XP bar, rank badge, best streak, total minutes logged
7. **Leaderboard** — global ranking of all users by current streak or total XP (toggle); no friend system in v1

---

## Data Model

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | matches `auth.users.id` |
| display_name | text | seeded from Google name; user-editable |
| avatar_url | text | seeded from Google photo; not editable in-app |
| level | int | default 1 |
| xp | int | cumulative, default 0 |
| current_streak | int | days, default 0 |
| best_streak | int | days, default 0 |
| total_minutes | int | cumulative, default 0 |
| updated_at | timestamptz | |

### `activities`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id) | |
| type | text | one of the 9 activity types |
| duration_minutes | int | |
| photo_url | text | Supabase Storage path |
| logged_at | timestamptz | |

### `streak_days`
| Column | Type | Notes |
|---|---|---|
| user_id | uuid (FK → profiles.id) | |
| date | date | |
| minutes_logged | int | daily aggregate |
| PRIMARY KEY (user_id, date) | | |

---

## Game Mechanics

### Streak
- A streak day requires ≥ 30 minutes of activity logged before **UTC midnight**.
- Missing a day resets `current_streak` to 0.
- `best_streak` is updated whenever `current_streak` exceeds it.
- Timezone support (per-user local midnight) is out of scope for v1.

### XP
- Base: **1 XP per minute** for the first 30 minutes.
- Bonus: minutes above 30 earn `1 × (1 + 0.05 × current_streak)` XP each — the streak multiplier is surfaced in the UI.
- XP is calculated server-side in a Server Action on activity submission, then written atomically with the activity row.

### Level thresholds
```
xp_to_next_level(lvl) = round(160 + lvl × 80 + lvl^1.7 × 14)
```

### Rank ladder (derived from level, never stored)
| Rank | Levels |
|---|---|
| Wood | 1–9 |
| Bronze | 10–19 |
| Silver | 20–34 |
| Gold | 35–49 |
| Platinum | 50–69 |
| Diamond | 70–89 |
| Obsidian | 90+ |

Each rank has 3 divisions (III → II → I) based on position within the tier. Rank is computed on the fly from `level` — not stored.

---

## Auth Flow

1. User clicks "Sign in with Google" → Supabase Auth Google OAuth redirect.
2. On first sign-in, a `profiles` row is created via a Supabase database trigger, seeding `display_name` from `raw_user_meta_data.full_name` and `avatar_url` from `raw_user_meta_data.avatar_url`.
3. Subsequent sign-ins update `avatar_url` (Google may rotate it) but never overwrite `display_name`.
4. Session is managed by Supabase Auth; Next.js middleware protects all routes except `/` (sign-in).

---

## Design Tokens

| Token | Value |
|---|---|
| Background (dark) | `#0a0f0a` |
| Surface (dark) | `#1a221a` |
| Accent (lime) | `#c8ff3d` |
| Flame (streak/bonus) | `#ff7a36` |
| Ink (dark) | `#f5f5f0` |
| Background (light) | `#f5f4ef` |
| Accent (light) | `#9ee022` |
| Display font | Bricolage Grotesque |
| Body font | Geist |
| Mono font | JetBrains Mono |

Dark mode is default; light mode toggle available. Fully responsive — mobile-first with desktop breakpoints.

---

## Image Storage

- Proof photos are uploaded to Supabase Storage bucket `activity-proofs`.
- Bucket is private; signed URLs generated per-request for display.
- Max file size: 5MB. Accepted formats: JPEG, PNG, WEBP.
- `photo_url` in `activities` stores the storage path (not a full URL).

---

## Error Handling

- Activity submission is a single Server Action that writes `activities`, updates `streak_days`, recalculates XP/level, and updates `profiles` — all in a Postgres transaction. On failure, nothing is partially written.
- Photo upload happens client-side before form submission; if upload fails the form stays open with an error message.
- Streak calculation runs only on the server; the client never computes XP.
