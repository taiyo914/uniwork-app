import { createClient } from '@/utils/supabase/server'
import ProfileEditor from './ProfileEditor'

export const revalidate = 0;

export default async function Page() {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return (
    <div>
      <ProfileEditor initialProfile={profile} />
    </div>
  )
}
