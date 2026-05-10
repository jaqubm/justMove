'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onUpload: (path: string) => void
}

export default function PhotoUpload({ onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, and WEBP are accepted')
      return
    }

    setError(null)
    setUploading(true)
    setPreview(URL.createObjectURL(file))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setUploading(false)
      return
    }

    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('activity-proofs')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setPreview(null)
    } else {
      onUpload(path)
    }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
      />

      {preview ? (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="Activity proof" className="w-full h-44 object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null)
              onUpload('')
              inputRef.current?.click()
            }}
            className="absolute top-2 right-2 text-white text-xs px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%', height: 220, borderRadius: 18, border: 'none',
            background: 'linear-gradient(180deg, oklch(0.32 0.05 16), oklch(0.18 0.04 16))',
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 12px, transparent 12px 24px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, cursor: 'pointer', position: 'relative',
            opacity: uploading ? 0.5 : 1,
          }}
        >
          {uploading ? (
            <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>Uploading…</span>
          ) : (
            <>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.18)',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6.5" width="18" height="13" rx="2.4"/>
                  <circle cx="12" cy="13" r="3.6"/>
                  <path d="M9 6.5l1.5-2h3L15 6.5"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, color: '#fff', opacity: 0.95 }}>Take photo</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>or pick from camera roll</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
