import { createClient } from '@/utils/supabase/server' 
import GroupChatClient from './GroupChatClient'

export const revalidate = 0;

export default async function GroupChatPage() {
  const supabase = createClient()

  const { data: initialMessages } = await supabase
    .from('messages')
    .select(`
      *,
      profiles!messages_sender_id_fkey (
        japanese_name,
        english_name,
        image_url
      ),
      reactions (
        reaction_id,
        user_id,
        reaction_type,
        target_id,
        profiles!reactions_user_id_fkey ( 
          japanese_name,
          english_name,
          image_url
        )
      )
    `)
    .eq('is_group_message', true)
    .order('created_at', { ascending: true })
    .limit(20)

  return <GroupChatClient initialMessages={initialMessages || []}  />
}