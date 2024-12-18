'use client'

import { Users } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { MemberCard } from "./MemberCard"

interface TeamMember {
  user_id: string
  english_name: string
  nationality: string
  languages: string
  shared_info: string
  favorite_foods: string
  dietary_restrictions: string
  hobbies: string
  image_url: string
  work_status: 'notStarted' | 'working' | 'onBreak'
  isTranslating?: boolean;
}

interface MemberListProps {
  teamMembers: TeamMember[]
}


export default function MemberList({ teamMembers: initialTeamMembers }: MemberListProps) {
  const supabase = createClient()
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const router = useRouter()
  const { locale } = useParams()
  const { user } = useUser();

  useEffect(() => {
    const fetchWorkStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, work_status')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching work status:', error);
        return;
      }

      if (data) {
        setTeamMembers(prevMembers => 
          prevMembers.map(member => {
            const updatedStatus = data.find(d => d.user_id === member.user_id);
            return updatedStatus 
              ? { ...member, work_status: updatedStatus.work_status }
              : member;
          })
        );
      }
    };

    fetchWorkStatus();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedUser = payload.new as TeamMember
          setTeamMembers(prevTeamMembers => {
            const memberToUpdate = prevTeamMembers.find(member => member.user_id === updatedUser.user_id)
            if (memberToUpdate && memberToUpdate.work_status !== updatedUser.work_status) {
              return prevTeamMembers.map(member => 
                member.user_id === updatedUser.user_id 
                  ? { ...member, work_status: updatedUser.work_status }
                  : member
              )
            }
            return prevTeamMembers
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Realtime subscription successful");
        } else {
          console.error("Realtime subscription error:", status);
        }
      });
      console.log("setting up realtime listener")

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleChatClick = (userId: string) => {
    if (userId === user?.id) {
      router.push(`/admin/profile`)
    } else {
      router.push(`/admin/chat/${userId}`)
    }
  }

  return (
    <div className="mx-auto px-4 md:px-6 ">
      <div className="h-4 sm:h-5"></div>
      <h1 className="text-xl sm:text-2xl font-bold">
        <Users className="h-6 w-6 inline-block mr-1.5 mb-1 ml-1 " />
        メンバー
      </h1>
      <div className="h-3 sm:h-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {teamMembers.map((member) => (
          <MemberCard
            key={member.user_id}
            member={member}
            locale={locale as string}
            userId={user?.id}
            onChatClick={handleChatClick}
          />
        ))}
      </div>
      <div className="h-6"></div>
    </div>
  )
} 