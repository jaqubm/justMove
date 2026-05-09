import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />
      <main className="md:pl-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
