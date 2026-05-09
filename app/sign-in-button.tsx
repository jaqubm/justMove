'use client'
import { createClient } from '@/lib/supabase/client'

export default function SignInButton() {
  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      style={{
        width: '100%', height: 60, borderRadius: 9999,
        background: 'var(--ink)', color: 'var(--bg)', border: 'none',
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        cursor: 'pointer', letterSpacing: '-0.01em',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.13 4.13 0 01-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.62z" fill="#4285f4"/>
        <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.96v2.34A8.99 8.99 0 009 18z" fill="#34a853"/>
        <path d="M3.93 10.68A5.4 5.4 0 013.64 9c0-.58.1-1.15.29-1.68V4.98H.96A8.99 8.99 0 000 9c0 1.45.35 2.83.96 4.02l2.97-2.34z" fill="#fbbc05"/>
        <path d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.42 0 9 0A8.99 8.99 0 00.96 4.98l2.97 2.34C4.64 5.18 6.64 3.58 9 3.58z" fill="#ea4335"/>
      </svg>
      Continue with Google
    </button>
  )
}
