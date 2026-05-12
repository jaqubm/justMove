# Project: justMove

A mobile app that helps people build a daily movement habit by raising a virtual pet that evolves based on how they move in real life. Think Finch's warmth meets Habitica's RPG progression, focused on physical activity.

## Quick Context

- **Platform:** Mobile only (iOS first, Android via Health Connect later)
- **Stack:** Expo (React Native) + Supabase (Auth + Postgres + Storage + Edge Functions)
- **Stage:** Greenfield. Phase 0 (setup) in progress.
- **Solo developer.** Optimize for shipping, not architectural purity.

## Core Loop

User logs daily movement (auto via HealthKit, or manual) → 30+ minutes maintains streak and feeds pet → extra minutes give bonus XP → pet levels and evolves along paths shaped by activity type (cardio → Swift, strength → Mighty, yoga → Zen, etc.) → coins earned for cosmetics.

## Deeper Documentation

Read these when working on related areas:

- **Product spec:** `docs/product-spec.md` — full feature list, tone, target user
- **Tech stack:** `docs/tech-stack.md` — libraries, versions, patterns, conventions
- **Database schema:** `docs/database-schema.md` — tables, RLS policies, migrations
- **Roadmap:** `docs/roadmap.md` — phase-by-phase plan, current focus

## Critical Conventions

- **TypeScript strict mode.** No `any` without comment justifying why.
- **Server state:** TanStack Query. **Client state:** Zustand. Never useState for anything that crosses screens.
- **Styling:** NativeWind (Tailwind classes). No inline styles except dynamic values.
- **File-based routing:** expo-router. Routes in `/app`, components in `/components`, hooks in `/hooks`, server logic in `/lib/supabase`.
- **Database access:** Always through typed Supabase client wrappers in `/lib/supabase`. Never raw queries in components.
- **RLS first.** Every new table needs RLS policies in the same migration that creates it. Never disable RLS.
- **Errors:** User-facing errors are friendly and actionable. Internal errors logged to Sentry with context.

## What This App Is NOT

- Not a fitness tracker with charts and data as the main UI
- Not competitive (no global leaderboards)
- Not a calorie counter
- Not childish — adult users who like a cute pet

## When Suggesting Code

- Prefer simple solutions over clever ones. This is a solo project.
- Don't add abstractions for hypothetical future needs.
- Match existing patterns in the codebase before introducing new ones.
- If a library is needed, check `docs/tech-stack.md` first — we may already have one for that.
- Ask before adding a new dependency.

## Commands

- `npm run dev` — start Expo dev server
- `npm run lint` — ESLint + TypeScript check
- `npm run test` — Vitest unit tests
- `npx supabase db push` — apply local migrations to remote
- `npx supabase functions deploy <name>` — deploy edge function