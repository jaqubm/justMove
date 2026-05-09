import { describe, it, expect } from 'vitest'
import { calculateXP, applyXP, xpToNextLevel, getRankInfo, RANKS } from './game'

describe('calculateXP', () => {
  it('gives 1 XP per minute for sessions under 30 min', () => {
    expect(calculateXP(20, 0)).toBe(20)
  })

  it('gives 30 XP for exactly 30 minutes regardless of streak', () => {
    expect(calculateXP(30, 15)).toBe(30)
  })

  it('applies no streak bonus to base minutes', () => {
    expect(calculateXP(40, 0)).toBe(40) // 30 + round(10 * 1.0)
  })

  it('applies streak multiplier to bonus minutes only', () => {
    expect(calculateXP(40, 10)).toBe(45) // 30 + round(10 * 1.5)
  })

  it('handles large streaks without overflowing', () => {
    expect(calculateXP(60, 100)).toBeGreaterThan(60)
  })
})

describe('xpToNextLevel', () => {
  it('returns 254 for level 1', () => {
    expect(xpToNextLevel(1)).toBe(254)
  })

  it('strictly increases with level', () => {
    for (let i = 1; i < 50; i++) {
      expect(xpToNextLevel(i + 1)).toBeGreaterThan(xpToNextLevel(i))
    }
  })
})

describe('applyXP', () => {
  it('adds XP without leveling up when below threshold', () => {
    const { newXP, newLevel } = applyXP(0, 1, 100)
    expect(newXP).toBe(100)
    expect(newLevel).toBe(1)
  })

  it('levels up when XP reaches threshold', () => {
    const threshold = xpToNextLevel(1) // 254
    const { newXP, newLevel } = applyXP(0, 1, threshold)
    expect(newLevel).toBe(2)
    expect(newXP).toBe(0)
  })

  it('carries over remaining XP after level-up', () => {
    const { newXP, newLevel } = applyXP(0, 1, xpToNextLevel(1) + 50)
    expect(newLevel).toBe(2)
    expect(newXP).toBe(50)
  })

  it('handles multiple level-ups in one go', () => {
    const twoLevels = xpToNextLevel(1) + xpToNextLevel(2)
    const { newLevel } = applyXP(0, 1, twoLevels)
    expect(newLevel).toBe(3)
  })
})

describe('getRankInfo', () => {
  it('returns Wood III for level 1', () => {
    const r = getRankInfo(1)
    expect(r.key).toBe('wood')
    expect(r.roman).toBe('III')
  })

  it('returns Bronze for level 10', () => {
    expect(getRankInfo(10).key).toBe('bronze')
  })

  it('returns Obsidian for level 90', () => {
    expect(getRankInfo(90).key).toBe('obsidian')
  })

  it('returns division I for the top third of Wood (levels 7-9)', () => {
    expect(getRankInfo(9).roman).toBe('I')
    expect(getRankInfo(7).roman).toBe('I')
  })

  it('returns null next rank for Obsidian', () => {
    expect(getRankInfo(99).next).toBeNull()
  })

  it('covers all levels 1-99 without throwing', () => {
    for (let lvl = 1; lvl <= 99; lvl++) {
      const r = getRankInfo(lvl)
      expect(r.key).toBeDefined()
    }
  })
})
