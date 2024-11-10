'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, UtensilsCrossed, Info, Heart, Users, MessageCircle, Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { translateJson } from "@/utils/translateJson"
import { translateText } from "@/utils/translate"
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
      router.push(`/employee/${locale}/profile`)
    } else {
      router.push(`/employee/${locale}/chat/${userId}`)
    }
  }

  return (
    <div className="mx-auto px-4 md:px-6 bg-gray-50/50">
      <div className="h-4 sm:h-6"></div>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
        <Users className="h-7 w-7 inline-block mr-2 mb-1 ml-1 " />メンバー
      </h1>
      <div className="h-3 sm:h-6"></div>
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