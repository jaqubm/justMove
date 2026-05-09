export type ActivityType =
  | 'walk' | 'run' | 'cycle' | 'gym' | 'yoga'
  | 'sport' | 'dance' | 'hike' | 'move'

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walk: 'Walk', run: 'Run', cycle: 'Cycling', gym: 'Gym',
  yoga: 'Yoga', sport: 'Sports', dance: 'Dance', hike: 'Hike', move: 'Move',
}

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  level: number
  xp: number
  current_streak: number
  best_streak: number
  total_minutes: number
  updated_at: string
}

export interface Activity {
  id: string
  user_id: string
  type: ActivityType
  duration_minutes: number
  photo_url: string
  logged_at: string
}

export interface StreakDay {
  user_id: string
  date: string
  minutes_logged: number
}

export interface Rank {
  key: string
  name: string
  min: number
  max: number
  color: string
  ink: string
}

export interface RankInfo extends Rank {
  roman: string
  levelInTier: number
  tierSize: number
  next: Rank | null
}

export interface LogActivityResult {
  earned_xp: number
  new_level: number
  new_streak: number
}
