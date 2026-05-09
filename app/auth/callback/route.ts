import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    if (session?.user) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        display_name: session.user.user_metadata?.full_name ?? 'Mover',
        avatar_url: session.user.user_metadata?.avatar_url ?? null,
      }, { onConflict: 'id', ignoreDuplicates: true })
    }
  }

  return NextResponse.redirect(`${origin}/home`)
}
