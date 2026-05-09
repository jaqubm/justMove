import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignInButton from './sign-in-button'

export default async function SignInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/home')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-5xl font-bold tracking-tight"
              style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            just<span style={{ color: 'var(--accent)' }}>Move</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            30 minutes a day. Every day. Level up.
          </p>
        </div>
        <SignInButton />
      </div>
    </main>
  )
}
