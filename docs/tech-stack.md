# Tech Stack & Conventions

## Core

| Concern | Choice | Notes |
|---|---|---|
| Framework | Expo SDK 52+ | New architecture enabled |
| Language | TypeScript strict | No `any` without justification |
| Routing | expo-router | File-based, in `/app` |
| Styling | NativeWind v4 | Tailwind classes |
| Server state | TanStack Query v5 | All Supabase reads/writes |
| Client state | Zustand | Cross-screen client state only |
| Forms | react-hook-form + zod | Validation via zod schemas |
| Backend | Supabase | Auth, Postgres, Storage, Edge Functions |
| Auth | Supabase + expo-auth-session | Google OAuth |
| Animations | react-native-reanimated v3 + Lottie | Lottie for pet, Reanimated for UI |
| Notifications | expo-notifications + Expo Push | No FCM directly |
| Errors | Sentry | `@sentry/react-native` |
| Analytics | PostHog | `posthog-react-native` |
| Payments | RevenueCat | When IAP is needed |

## Native Modules

- `react-native-health` (kingstinct fork) for HealthKit
- `expo-haptics` for tactile feedback
- `expo-image-picker` + `expo-image-manipulator` for photos
- `expo-secure-store` for any sensitive client storage

## Patterns

### Supabase Client
- Single client instance in `/lib/supabase/client.ts`
- Typed via generated types from `npx supabase gen types typescript`
- Regenerate types after every migration

### Data Access Layer
- All DB reads/writes go through functions in `/lib/supabase/queries/`
- One file per domain: `pets.ts`, `activities.ts`, `streaks.ts`
- Each function returns typed result, throws on error
- TanStack Query hooks wrap these in `/hooks/queries/`

### Component Structure
- Screens in `/app/(routes)/` — thin, mostly composition
- Reusable UI in `/components/ui/`
- Feature components in `/components/<feature>/`
- One component per file, named export matching filename

### Error Handling
- Network errors: show toast, log to Sentry, allow retry
- Validation errors: inline near the field
- Auth errors: redirect to sign-in with friendly message
- Never expose raw error messages to user

## Free Tier Limits (Watch These)

- Supabase: 500 MB DB, 1 GB storage, 50k MAU, 5 GB bandwidth
- EAS Build: 30 builds/month
- Expo Push: unlimited but rate-limited per device
- Sentry: 5k errors/month free
- PostHog: 1M events/month free

## Don't Use

- Redux / MobX (Zustand is enough)
- Moment.js (use date-fns)
- styled-components (NativeWind only)
- React Navigation directly (expo-router wraps it)
- Raw fetch to Supabase REST (use the JS client)