import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ActivityCard from '@/components/activity-card'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(100)

  const activitiesWithUrls = await Promise.all(
    (activities ?? []).map(async activity => {
      const { data } = await supabase.storage
        .from('activity-proofs')
        .createSignedUrl(activity.photo_url, 3600)
      return { activity, photoUrl: data?.signedUrl ?? null }
    })
  )

  // Group by date
  const grouped: Record<string, typeof activitiesWithUrls> = {}
  for (const item of activitiesWithUrls) {
    const date = new Date(item.activity.logged_at).toISOString().split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(item)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Activity Log</h1>

      {Object.keys(grouped).length === 0 && (
        <p className="text-ink-dim text-sm text-center py-12">
          No activities yet. Log your first one!
        </p>
      )}

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="space-y-2">
          <p className="text-xs font-mono text-ink-dim uppercase tracking-wider">
            {new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'long',
            })}
          </p>
          {items.map(({ activity, photoUrl }) => (
            <ActivityCard key={activity.id} activity={activity} photoUrl={photoUrl} />
          ))}
        </div>
      ))}
    </div>
  )
}
