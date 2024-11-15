import { createClient } from "@/utils/supabase/client"
import MemberList from "./MemberList"

interface TeamMember {
  user_id: number
  english_name: string
  nationality: string
  languages: string
  shared_info: string
  favorite_foods: string
  dietary_restrictions: string
  hobbies: string
  image_url: string
  work_status: 'notStarted' | 'working' | 'onBreak'
}

export const revalidate = 0;

export default async function Component() {
  const supabase = createClient()
  const { data: teamMembers, error } = await supabase
    .from('profiles')
    .select(`
      user_id,
      english_name,
      nationality,
      languages,
      shared_info,
      favorite_foods,
      dietary_restrictions,
      hobbies,
      image_url,
      work_status
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', error)
    return <div>Error occured. Please try again later.</div>
  }

  return (
    <MemberList teamMembers={teamMembers} />
  )
}