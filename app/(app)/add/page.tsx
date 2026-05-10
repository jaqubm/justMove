'use client'
import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logActivity } from '@/app/actions/activity'
import PhotoUpload from '@/components/photo-upload'
import ActivityGlyph from '@/components/activity-glyph'
import { ACTIVITY_LABELS, type ActivityType } from '@/lib/types'
import { calculateXP } from '@/lib/game'

const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABELS) as ActivityType[]

const HUES: Record<ActivityType, number> = {
  walk: 130, run: 16, cycle: 200, gym: 280, yoga: 320,
  sport: 50, dance: 340, hike: 100, move: 70,
}

const QUICK_MINS = [15, 30, 45, 60, 90]

export default function AddActivityPage() {
  const router                   = useRouter()
  const [state, action, pending] = useActionState(logActivity, null)
  const [selectedType, setType]  = useState<ActivityType | null>(null)
  const [photoPath, setPhoto]    = useState('')
  const [minutes, setMinutes]    = useState(30)

  useEffect(() => {
    if (state?.result) router.push('/home')
  }, [state?.result, router])

  const xpBoost    = minutes > 30 ? calculateXP(minutes, 0) - 30 : 0
  const sliderPct  = Math.min(100, (minutes / 90) * 100)
  const baselineAt = (30 / 90) * 100

  const activityGrid = (cols: number) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {ACTIVITY_TYPES.slice(0, 9).map(type => {
        const active = selectedType === type
        const hue    = HUES[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => setType(type)}
            aria-label={`Select ${ACTIVITY_LABELS[type]}`}
            style={{
              aspectRatio: '1', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: active ? 'var(--accent)' : 'var(--surface)',
              outline: active ? 'none' : '1px solid var(--line)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, fontFamily: 'inherit',
              color: active ? 'var(--accent-ink)' : 'var(--ink)',
            }}
          >
            <ActivityGlyph
              type={type} size={22}
              color={active ? 'var(--accent-ink)' : `oklch(0.78 0.16 ${hue})`}
            />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>{ACTIVITY_LABELS[type]}</span>
          </button>
        )
      })}
    </div>
  )

  const minutesWidget = (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 14 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 800,
          letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 0.9,
        }}>{minutes}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-dim)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>min</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {QUICK_MINS.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            style={{
              flex: 1, height: 32, borderRadius: 8, border: '1px solid var(--line)',
              background: m === minutes ? 'var(--surface2)' : 'transparent',
              color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 11,
              fontWeight: 700, cursor: 'pointer',
            }}
          >{m}</button>
        ))}
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--surface2)', borderRadius: 999 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${sliderPct}%`, background: 'var(--accent)', borderRadius: 999,
        }} />
        <div style={{
          position: 'absolute', left: `${baselineAt}%`, top: -3, bottom: -3, width: 2,
          background: 'var(--flame)', borderRadius: 1,
        }} />
        <div style={{
          position: 'absolute', left: `calc(${sliderPct}% - 10px)`,
          top: -7, width: 20, height: 20, borderRadius: '50%',
          background: 'var(--ink)', border: '3px solid var(--accent)',
          cursor: 'pointer',
        }} />
        <input
          type="range" min="1" max="90" value={minutes}
          onChange={e => setMinutes(parseInt(e.target.value, 10))}
          aria-label="Duration in minutes"
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
        />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)',
      }}>
        <span>0m</span>
        <span style={{ color: 'var(--flame)' }}>30m baseline</span>
        <span>90m</span>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile ── */}
      <div className="md:hidden">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22,
          }}>
            <Link href="/home" style={{ fontSize: 15, color: 'var(--ink-dim)', textDecoration: 'none' }}>← Cancel</Link>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>New activity</span>
            <span style={{ fontSize: 15, color: 'var(--ink-dim)', opacity: 0.4 }}>Save</span>
          </div>
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>1 — proof photo</div>
              <PhotoUpload onUpload={setPhoto} />
              <input type="hidden" name="photo_url" value={photoPath} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>2 — activity</div>
              {activityGrid(4)}
              <input type="hidden" name="type" value={selectedType ?? ''} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>3 — minutes</span>
                {xpBoost > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>+{xpBoost}xp boost</span>
                )}
              </div>
              {minutesWidget}
              <input type="hidden" name="duration_minutes" value={minutes} />
            </div>
            {state?.error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending || !selectedType || !photoPath}
              style={{
                width: '100%', height: 58, borderRadius: 16, border: 'none',
                background: 'var(--accent)', color: 'var(--accent-ink)',
                fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: pending || !selectedType || !photoPath ? 0.4 : 1, marginBottom: 8,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              {pending ? 'Saving…' : 'Lock it in'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block" style={{ padding: '28px 36px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>New activity</h1>
            <Link href="/home" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)', textDecoration: 'none' }}>← Cancel</Link>
          </div>
          <form action={action}>
            <input type="hidden" name="photo_url" value={photoPath} />
            <input type="hidden" name="type" value={selectedType ?? ''} />
            <input type="hidden" name="duration_minutes" value={minutes} />
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, alignItems: 'start' }}>
              {/* Left: photo */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Proof photo</div>
                <div style={{ height: 360 }}>
                  <PhotoUpload onUpload={setPhoto} />
                </div>
              </div>
              {/* Right: activity + minutes + submit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Activity type</div>
                  {activityGrid(3)}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</span>
                    {xpBoost > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>+{xpBoost}xp boost</span>
                    )}
                  </div>
                  {minutesWidget}
                </div>
                {state?.error && (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)', margin: 0 }}>{state.error}</p>
                )}
                <button
                  type="submit"
                  disabled={pending || !selectedType || !photoPath}
                  style={{
                    width: '100%', height: 56, borderRadius: 14, border: 'none',
                    background: 'var(--accent)', color: 'var(--accent-ink)',
                    fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: pending || !selectedType || !photoPath ? 0.4 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  {pending ? 'Saving…' : 'Lock it in'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
