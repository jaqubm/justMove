# justMove

justMove is an iOS app that helps adults build a daily movement habit by raising a virtual pet that evolves based on how they move in real life. Log 30 minutes of activity to keep your streak alive and your pet happy — extra minutes earn bonus XP, and your pet's evolution path is shaped by what you do most (cardio, strength, yoga, and more). Think Finch's warmth meets Habitica's RPG progression, focused entirely on physical activity.

## Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [EAS CLI](https://docs.expo.dev/build/setup/) for device builds (`npm install -g eas-cli`)
- A Supabase project with Google OAuth configured (see setup below)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create your `.env` file**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase project URL and publishable key from **Supabase → Project Settings → API**.

3. **Link the Supabase CLI** (needed for migrations and type generation)

   ```bash
   npx supabase login
   npx supabase link
   ```

4. **Apply migrations**

   Push manually on first setup (subsequent migrations deploy automatically via the GitHub integration):

   ```bash
   npx supabase db push
   ```

5. **Build and run on device**

   A dev build is required (Expo Go does not support all native modules used):

   ```bash
   eas build --profile development --platform ios
   ```

   Then start the dev server:

   ```bash
   npm run dev
   ```

## Common Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Expo dev server |
| `npm run lint` | ESLint + TypeScript check |
| `npm run typecheck` | TypeScript check only |
| `npm run test` | Vitest unit tests |
| `npx supabase db push` | Push local migrations to remote |
| `npx supabase gen types typescript --linked > types/database.ts` | Regenerate DB types after a migration |
| `npx supabase functions deploy <name>` | Deploy an edge function |
