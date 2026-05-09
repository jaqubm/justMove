import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RankBadge from '@/components/rank-badge'
import Image from 'next/image'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'streak' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const sortColumn = sort === 'xp' ? 'xp' : 'current_streak'

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, level, xp, current_streak')
    .order(sortColumn, { ascending: false })
    .limit(50)

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">Leaderboard</h1>

      {/* Sort toggle */}
      <div className="flex gap-2">
        {[
          { key: 'streak', label: '🔥 Streak' },
          { key: 'xp',     label: '⭐ XP' },
        ].map(tab => (
          <a
            key={tab.key}
            href={`/leaderboard?sort=${tab.key}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sort === tab.key
                ? 'text-accent-ink'
                : 'text-ink-muted bg-surface border border-line hover:text-ink'
            }`}
            style={sort === tab.key ? { backgroundColor: 'var(--accent)' } : undefined}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {(profiles ?? []).map((profile, idx) => {
          const isMe = profile.id === user.id
          const value = sort === 'xp'
            ? `${profile.xp.toLocaleString()} XP`
            : `${profile.current_streak}d 🔥`

          return (
            <div
              key={profile.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isMe
                  ? 'border-accent bg-accent/5'
                  : 'border-line bg-surface'
              }`}
            >
              <span className="font-mono text-sm text-ink-dim w-6 text-right flex-shrink-0">
                {idx + 1}
              </span>
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  width={36}
                  height={36}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-surface2 flex items-center justify-center text-sm font-bold text-ink flex-shrink-0">
                  {profile.display_name[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {profile.display_name}
                  {isMe && <span className="ml-1.5 text-xs text-ink-dim">(you)</span>}
                </p>
                <div className="mt-0.5">
                  <RankBadge level={profile.level} size="sm" />
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-ink flex-shrink-0">
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
