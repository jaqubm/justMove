# Product Specification

## Target User

Adults (20s–40s) who struggle with motivation to move daily. They've tried fitness apps and bounced off the intensity. They respond to warmth, cuteness, and gentle accountability — not streaks-as-punishment or aggressive coaching.

## Tone & Voice

- Warm, encouraging, cozy
- Never shame-inducing on missed days
- Pet feels like a friend, not a tamagotchi guilt object
- Microcopy is conversational, occasionally playful
- No fitness-bro language ("crush it," "beast mode," "no excuses")

## Core Features

### Activity Logging
- Auto-log via HealthKit (workouts, active minutes)
- Manual entry as fallback for missed/untracked activities
- 5 categories: Cardio, Strength, Flexibility, Sport, Lifestyle
- Each activity: category, minutes, optional notes, optional photo (social only — not used for verification)

### Streak System
- 30 minutes daily minimum to maintain
- 3-day grace window: skip a day, pet gets tired but recoverable
- Restore costs: 30 min (day 1), 45 min (day 2), 60 min (day 3)
- After 3 days, streak breaks and pet becomes "exhausted" (not "dead" — softer framing)
- One streak-freeze token per week, auto-granted Mondays
- Optional paid revive: $0.99 instant restore

### Pet System
- One pet per user
- Created at onboarding: species → color → name
- Levels via XP from activities
- Mood reflects streak status (happy / neutral / tired / exhausted)
- Evolution at levels 5, 15, 30, 50 — visual changes
- Evolution path determined by dominant activity category over last 30 days
- 6 paths: Swift, Mighty, Zen, Playful, Wanderer, Balanced (fallback)
- Past forms saved to "memories album"

### Economy
- Coins earned from: daily activity, weekly quests, achievements, level-ups
- Skill points earned at level-up (banked for future use, no spend in v1)
- Shop: cosmetics (hats, collars, room backgrounds, toys)
- Cosmetics are catalog data in Postgres, not hardcoded

### Social (later phases)
- Friends via share code or username
- 7-day duo challenges (double XP on completion)
- Shared activity feed with optional photos
- Reactions on friend activities (emoji)
- No global leaderboards. Intentional.

## Key Screens

1. Onboarding (welcome → Google sign-in → pet creation)
2. Home (pet hero, progress ring, streak, quick-log)
3. Activity log (history list, manual entry form)
4. Pet detail (full pet, stats, memories album, equipment)
5. Stats / profile (level, totals, category mix)
6. Shop (cosmetics grid)
7. Friends (list, challenges, feed)
8. Settings

## Out of Scope (v1)

- Apple Watch standalone app
- Android (Phase 8+)
- Web companion
- Multiple pets per user
- Pet breeding / trading
- Real-money trading of cosmetics
- AI photo verification