import type { Rank, RankInfo } from './types'

export const RANKS: Rank[] = [
  { key: 'wood',     name: 'Wood',     min: 1,  max: 9,   color: '#8a6a44', ink: '#fbf1de' },
  { key: 'bronze',   name: 'Bronze',   min: 10, max: 19,  color: '#cd7f32', ink: '#1a0d00' },
  { key: 'silver',   name: 'Silver',   min: 20, max: 34,  color: '#c0c5cf', ink: '#10141a' },
  { key: 'gold',     name: 'Gold',     min: 35, max: 49,  color: '#f4c430', ink: '#1a1300' },
  { key: 'platinum', name: 'Platinum', min: 50, max: 69,  color: '#7defc8', ink: '#04241a' },
  { key: 'diamond',  name: 'Diamond',  min: 70, max: 89,  color: '#7ec8ff', ink: '#001a2a' },
  { key: 'obsidian', name: 'Obsidian', min: 90, max: 999, color: '#1a1a1a', ink: '#c8ff3d' },
]

export function xpToNextLevel(level: number): number {
  return Math.round(160 + level * 80 + Math.pow(level, 1.7) * 14)
}

export function getRankInfo(level: number): RankInfo {
  const rank = RANKS.find(r => level >= r.min && level <= r.max) ?? RANKS[0]
  const tierSize = rank.max - rank.min + 1
  const idx = level - rank.min
  const sub = Math.min(2, Math.floor((idx / tierSize) * 3))
  const roman = (['III', 'II', 'I'] as const)[sub]
  const next = RANKS[RANKS.indexOf(rank) + 1] ?? null
  return { ...rank, roman, levelInTier: idx + 1, tierSize, next }
}

export function calculateXP(durationMinutes: number, currentStreak: number): number {
  const baseMins = Math.min(durationMinutes, 30)
  const bonusMins = Math.max(0, durationMinutes - 30)
  const multiplier = 1 + 0.05 * currentStreak
  return baseMins + Math.round(bonusMins * multiplier)
}

export function applyXP(
  currentXP: number,
  currentLevel: number,
  earnedXP: number,
): { newXP: number; newLevel: number } {
  let xp = currentXP + earnedXP
  let level = currentLevel
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level)
    level++
  }
  return { newXP: xp, newLevel: level }
}
