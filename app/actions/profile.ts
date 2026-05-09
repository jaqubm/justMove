'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface ProfileState {
  error?: string
  success?: boolean
}

export async function updateDisplayName(
  _prev: ProfileState | null,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const displayName = (formData.get('display_name') as string ?? '').trim()
  if (!displayName)            return { error: 'Name cannot be empty' }
  if (displayName.length > 50) return { error: 'Name must be 50 characters or less' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}
