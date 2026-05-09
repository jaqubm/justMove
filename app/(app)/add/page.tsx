'use client'
import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { logActivity } from '@/app/actions/activity'
import PhotoUpload from '@/components/photo-upload'
import ActivityGlyph from '@/components/activity-glyph'
import { ACTIVITY_LABELS, type ActivityType } from '@/lib/types'

const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABELS) as ActivityType[]

export default function AddActivityPage() {
  const router = useRouter()
  const [state, action, pending] = useActionState(logActivity, null)
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null)
  const [photoPath, setPhotoPath] = useState('')

  useEffect(() => {
    if (state?.result) router.push('/home')
  }, [state?.result, router])

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        Log Activity
      </h1>

      <form action={action} className="space-y-6">
        {/* Activity type picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>
            Activity type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACTIVITY_TYPES.map(type => {
              const active = selectedType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors text-sm font-medium"
                  style={{
                    borderColor: active ? 'var(--accent)' : 'var(--line)',
                    backgroundColor: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--surface)',
                    color: active ? 'var(--accent)' : 'var(--ink-muted)',
                  }}
                >
                  <ActivityGlyph
                    type={type}
                    size={22}
                    color={active ? 'var(--accent)' : 'var(--ink-muted)'}
                  />
                  {ACTIVITY_LABELS[type]}
                </button>
              )
            })}
          </div>
          <input type="hidden" name="type" value={selectedType ?? ''} />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>
            Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration_minutes"
            type="number"
            min="1"
            max="480"
            placeholder="30"
            required
            className="w-full rounded-xl px-4 py-3 font-mono text-lg focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--line)')}
          />
        </div>

        {/* Photo proof */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-muted)' }}>
            Proof photo
          </label>
          <PhotoUpload onUpload={setPhotoPath} />
          <input type="hidden" name="photo_url" value={photoPath} />
        </div>

        {state?.error && (
          <p className="text-sm rounded-xl px-4 py-3"
             style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !selectedType || !photoPath}
          className="w-full py-4 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
        >
          {pending ? 'Saving…' : 'Save activity'}
        </button>
      </form>
    </div>
  )
}
