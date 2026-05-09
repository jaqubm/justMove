'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LogActivityResult } from '@/lib/types'

export interface ActivityState {
  error?: string
  result?: LogActivityResult
}

export async function logActivity(
  _prev: ActivityState | null,
  formData: FormData,
): Promise<ActivityState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const type            = formData.get('type') as string
  const durationStr     = formData.get('duration_minutes') as string
  const photoUrl        = formData.get('photo_url') as string
  const durationMinutes = parseInt(durationStr, 10)

  if (!type)                             return { error: 'Select an activity type' }
  if (!durationStr || durationMinutes < 1) return { error: 'Duration must be at least 1 minute' }
  if (durationMinutes > 480)             return { error: 'Duration cannot exceed 8 hours' }
  if (!photoUrl)                         return { error: 'Upload a proof photo before submitting' }

  const { data, error } = await supabase.rpc('log_activity', {
    p_user_id:          user.id,
    p_type:             type,
    p_duration_minutes: durationMinutes,
    p_photo_url:        photoUrl,
  })

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/log')
  revalidatePath('/profile')
  revalidatePath('/leaderboard')

  return { result: data as LogActivityResult }
}
