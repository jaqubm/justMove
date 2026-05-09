import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StreakCalendar from '@/components/streak-calendar'

export default async function StreakPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [{ data: profile }, { data: streakDays }] = await Promise.all([
    supabase.from('profiles').select('current_streak, best_streak').eq('id', user.id).single(),
    supabase.from('streak_days')
      .select('date, minutes_logged')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true }),
  ])

  if (!profile) redirect('/')

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Streak</h1>
      <StreakCalendar
        streakDays={streakDays ?? []}
        currentStreak={profile.current_streak}
        bestStreak={profile.best_streak}
      />
    </div>
  )
}
