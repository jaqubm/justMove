# Roadmap

## Current Phase

**Phase 1: Activity Logging** — not started

## Phase Summary

- **Phase 0:** Expo project, Supabase, Google OAuth, basic navigation ✅
- **Phase 1:** Activity logging, streak system with 3-day grace, weekly freeze
- **Phase 2:** Pet core (creation, levels, moods, basic visual states)
- **Phase 3:** HealthKit integration, auto-logging
- **Phase 4:** Evolution paths based on activity mix
- **Phase 5:** Coins, shop, cosmetics
- **Phase 6:** Friends, duo challenges, activity feed with photos
- **Phase 7:** Polish, personality quiz, achievements, App Store launch

## What's Done

### Phase 0 (2026-05-12)

- Expo SDK 54 project with expo-router v6 and new architecture enabled
- TypeScript strict mode + `noUncheckedIndexedAccess`
- NativeWind v4 + Tailwind CSS v3, initial pastel palette (subject to change after mockups)
- Supabase client configured (AsyncStorage sessions, URL polyfill, auto-refresh)
- `profiles` table with RLS (owner read/update) and auto-create trigger on signup
- Google OAuth via `supabase.auth.signInWithOAuth` + `expo-web-browser`
- `useSession` hook with `onAuthStateChange` subscription and AppState auto-refresh
- Auth gate in root layout (unauthenticated → sign-in, authenticated → home)
- Placeholder home screen showing signed-in email with sign-out
- Vitest with Node environment, native module stubs, smoke test passing
- ESLint, Prettier, `npm run lint / typecheck / test` all green
- Supabase GitHub integration for automatic migration deploys

## What's Next

- Phase 1: Activity logging screen and data model
- Activity categories: Cardio, Strength, Flexibility, Sport, Lifestyle
- Manual entry form (react-hook-form + zod)
- Streak state logic (30 min daily minimum, 3-day grace window)

## Decisions Log

- (2026-05-12) Chose Expo over bare React Native — single-developer productivity
- (2026-05-12) Chose Supabase over Firebase — Postgres + RLS over NoSQL
- (2026-05-12) Chose NativeWind over Tamagui — Tailwind familiarity from web background
- (2026-05-12) Used `--legacy-peer-deps` for NativeWind v4 install — `react-dom@19.2.6` (pulled in by nativewind transitively) requires `react@^19.2.6` but Expo SDK 54 ships with `react@19.1.0`; legacy mode resolves it without upgrading React
- (2026-05-12) Renamed `EXPO_PUBLIC_SUPABASE_ANON_KEY` → `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase renamed "anon key" to "publishable key" in their dashboard; kept naming consistent with what the developer sees
- (2026-05-12) Used browser-based Supabase OAuth (`signInWithOAuth` + `expo-web-browser`) instead of native Google Sign-In SDK — avoids a native module at Phase 0, simpler setup; trade-off is a browser popup rather than the native Google sheet. Can swap to `signInWithIdToken` + native SDK later without changing the auth gate or session hook
- (2026-05-12) Auth gate lives in root layout (`useSegments` + `useRouter` + `useEffect`) — straightforward expo-router pattern; no middleware or HOC needed at this scale
- (2026-05-12) Vitest module aliases instead of jest-expo for testing — keeps test toolchain light; native module stubs are explicit and easy to extend as more modules are added
