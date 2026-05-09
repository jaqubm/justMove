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
          className="w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--line)', color: 'var(--ink-dim)' }}
        >
          {uploading ? (
            <span className="text-sm">Uploading…</span>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span className="text-sm font-medium">Upload proof photo</span>
              <span className="text-xs opacity-60">JPEG · PNG · WEBP · max 5 MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  )
}
