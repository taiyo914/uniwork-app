"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessageCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useUser } from "@/hooks/useUser";
import { formatDistanceToNow, format, isThisYear } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ChatSpace {
  id: string;
  name: string;
  imageUrl?: string;
  unreadCount?: number;
  latestMessage?: string;
  latestMessageAt?: string;
}


export default function VerticalChatNav() {
  const supabase = createClient();
  const { userId, locale } = useParams();
  const pathname = usePathname();
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

  useEffect(() => {
    const fetchChatSpaces = async () => {
      const {data: {user}, error: userError} = await supabase.auth.getUser(); 
      if(userError || !user){
        console.error('Error fetching user:', userError);
        return;
      }
      const { data: groupRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('name', 'general_group_chat')
        .single();

      if (groupRoom) {
        // ユーザーがグループチャットのメンバーかチェック
        const { data: membership } = await supabase
          .from('room_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('room_id', groupRoom.id)
          .single();

        // メンバーでない場合は追加
        if (!membership) {
          await supabase
            .from('room_members')
            .insert({
              user_id: user.id,
              room_id: groupRoom.id,
              last_read_at: new Date().toISOString() // 参加時点を既読とする
            });
        }
      }

      // ルームサマリーとプロフィール情報の取得
      const [{ data: roomSummaries }, { data: profiles }] = await Promise.all([
        supabase.rpc('get_room_summary', {
          p_user_id: user.id
        }),
        supabase
          .from("profiles")
          .select("user_id, english_name, japanese_name, image_url")
          .neq("user_id", user.id)
          .order('english_name', { ascending: true })
      ]);

      const spaces: ChatSpace[] = [
        {
          id: groupRoom?.id,
          name: t('groupChat'),
          unreadCount: roomSummaries?.find((s: any) => s.room_id === groupRoom?.id)?.unread_count || 0,
          latestMessage: roomSummaries?.find((s: any) => s.room_id === groupRoom?.id)?.latest_message,
          latestMessageAt: roomSummaries?.find((s: any) => s.room_id === groupRoom?.id)?.latest_message_at,
        },
        ...(profiles?.map((profile) => {
          const dmRoom = roomSummaries?.find((s: any) => s.room_name.includes(profile.user_id));
          return {
            id: dmRoom?.room_id || profile.user_id,
            name: `${profile.english_name || profile.japanese_name}`,
            imageUrl: profile.image_url,
            unreadCount: dmRoom?.unread_count || 0,
            latestMessage: dmRoom?.latest_message,
            latestMessageAt: dmRoom?.latest_message_at,
          };
        }) || [])
      ];

      setChatSpaces(spaces);
    };

    fetchChatSpaces();

    const subscription = supabase
      .channel('chat_messages_nav')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        console.log('postgres_changes');
        fetchChatSpaces();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Realtime subscription successful in VerticalChatNav");
        } else {
          console.error("Realtime subscription error in VerticalChatNav:", status);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="h-full w-full sm:w-52 md:w-64 lg:w-72 sm:border-r-[2px]">
      <ScrollArea className="h-full ">
        <div className="xs:pb-4 pb-10 w-full">
          <h2 className="text-lg font-semibold px-3 lg:px-4 pt-4 pb-1">
            {t('title')}
          </h2>
          {chatSpaces.map((space) => (
            <Link
              key={space.id}
              href={`/employee/${locale}/chat2/${space.id}`}
              className={`flex items-center py-2.5 transition-colors w-full ${
                userId === space.id || pathname === `/employee/${locale}/chat2/${space.id}`
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-200"
              }`}
            >
              <div className="px-1.5 md:px-3">
                {space.name ===  t('groupChat') ? (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Users className="text-white h-5 w-5 md:h-6 md:w-6" />
                  </div>
                ) : (
                  <Avatar className="w-9 h-9 md:w-10 md:h-10">
                    <AvatarImage src={space.imageUrl} alt={space.name} className="object-cover"/>
                    <AvatarFallback>{space.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0 mr-1">
                <p className="xs:text-lg font-medium text-gray-900 truncate">{space.name}</p>
                {space.latestMessage && (
                  <p className="text-sm text-gray-500 truncate">{space.latestMessage}</p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <div>
                  { (space.unreadCount ?? 0) > 0 ? (
                    <span className="bg-blue-500 text-white text-[0.7rem] md:text-xs rounded-full  min-h-5 min-w-5 flex items-center justify-center mr-1 md:mr-1.5">
                      {space.unreadCount}
                    </span>
                  ) : (
                    <MessageCircle className="text-gray-400 h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-1.5" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
}
