# Database Schema

## Conventions

- Snake_case for tables and columns
- All tables have `id uuid primary key default gen_random_uuid()`
- All tables have `created_at timestamptz not null default now()`
- User-owned tables have `user_id uuid not null references auth.users(id) on delete cascade`
- RLS enabled on every table, policies in same migration
- Use `(select auth.uid())` in policies, not `auth.uid()` directly (query plan caching)
- Index every column used in RLS policies, foreign keys, and common WHERE clauses

## Core Tables

### profiles
Extends auth.users with app-specific fields. One row per user, created via trigger on signup.

### pets
One pet per user (v1). Tracks species, color, name, level, XP, evolution path and stage, mood, exhaustion state.

### activities
Logged movement events. Category, minutes, source (manual / healthkit / google_fit), optional photo URL, optional notes.

### pet_evolution_history
Snapshot record each time pet evolves. Used for memories album.

### streak_state
Computed and cached streak status per user. Or computed on-the-fly from activities — TBD based on query performance.

### cosmetics (catalog)
Static catalog of all cosmetic items. Type, name, price, image URL, unlock condition.

### inventory
User's owned cosmetics. user_id + cosmetic_id + acquired_at.

### equipped_items
Currently equipped cosmetic per slot per user.

### coin_balance
Current coin balance per user.

### coin_transactions
Audit log of all coin movements. Reason enum (daily_bonus, quest_reward, achievement, level_up, purchase, refund).

### friendships
Bidirectional friend relationships. user_a_id, user_b_id (lower UUID always user_a for uniqueness), status.

### duo_challenges
Active and completed 7-day challenges between friend pairs.

## RLS Policy Patterns

- Owner-only read/write: `(select auth.uid()) = user_id`
- Friend-visible read: subquery against friendships table (denormalize for perf at scale)
- Catalog tables (cosmetics): readable by all authenticated users, writable only by service role
- Aggregate queries: use security definer functions, not direct table access

## Migration Workflow

1. `npx supabase migration new <name>` creates timestamped file
2. Write SQL: table changes + RLS policies + indexes
3. Test locally with `npx supabase db reset`
4. Push to remote with `npx supabase db push`
5. Regenerate types: `npx supabase gen types typescript --linked > src/types/database.ts`