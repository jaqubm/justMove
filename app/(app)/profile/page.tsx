import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RankBadge from '@/components/rank-badge'
import XPBar from '@/components/xp-bar'
import EditNameForm from './edit-name-form'
import { getRankInfo, xpToNextLevel } from '@/lib/game'
import Image from 'next/image'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  const rank = getRankInfo(profile.level)

  async function signOut() {
    'use server'
    const s = await createClient()
    await s.auth.signOut()
    redirect('/')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>

      {/* Avatar + name */}
      <div className="bg-surface rounded-2xl p-6 border border-line space-y-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center text-2xl font-display font-bold text-ink">
              {profile.display_name[0].toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <EditNameForm currentName={profile.display_name} />
            <RankBadge level={profile.level} />
          </div>
        </div>

        {/* XP bar */}
        <XPBar level={profile.level} xp={profile.xp} />

        {/* Next rank hint */}
        {rank.next && (
          <p className="text-xs text-ink-dim font-mono">
            Level {rank.next.min} to reach{' '}
            <span style={{ color: rank.next.color }}>{rank.next.name}</span>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Best Streak', value: `${profile.best_streak}d`, icon: '🔥' },
          { label: 'Total Minutes', value: profile.total_minutes.toLocaleString(), icon: '⏱' },
          { label: 'Level', value: profile.level, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface rounded-xl p-3 border border-line text-center">
            <p className="text-lg">{stat.icon}</p>
            <p className="font-mono font-bold text-ink text-xl">{stat.value}</p>
            <p className="text-xs text-ink-dim mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-medium text-ink-muted border border-line hover:border-ink-dim hover:text-ink transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
