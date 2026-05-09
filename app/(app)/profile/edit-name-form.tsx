'use client'
import { useActionState, useState } from 'react'
import { updateDisplayName } from '@/app/actions/profile'

interface Props { currentName: string }

export default function EditNameForm({ currentName }: Props) {
  const [editing, setEditing] = useState(false)
  const [state, action, pending] = useActionState(updateDisplayName, null)

  if (state?.success && editing) setEditing(false)

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-display text-2xl font-bold text-ink">{currentName}</span>
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-ink-dim hover:text-ink transition-colors"
          aria-label="Edit name"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="display_name"
        defaultValue={currentName}
        maxLength={50}
        autoFocus
        className="bg-surface border border-line rounded-lg px-3 py-1.5 text-ink font-medium text-lg focus:outline-none focus:border-accent w-48"
      />
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {pending ? '…' : 'Save'}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-muted hover:text-ink border border-line"
      >
        Cancel
      </button>
      {state?.error && (
        <p className="text-xs text-red-500 ml-1">{state.error}</p>
      )}
    </form>
  )
}
