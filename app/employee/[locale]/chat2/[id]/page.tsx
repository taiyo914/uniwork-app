"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageForm from './MessageForm';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  english_name: string;
  japanese_name: string;
  image_url: string;
  reactions: {
    emoji: string;
    user_id: string;
  }[];
}

export default function ChatRoom() {
  const supabase = createClient();
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const fetchMessages = async (targetRoomId: string) => {
    const { data, error } = await supabase
      .rpc('get_room_messages', {
        p_room_id: targetRoomId
      });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    setCurrentRoomId(targetRoomId);

    // 既読を更新
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('room_members')
        .upsert({
          user_id: user.id,
          room_id: targetRoomId,
          last_read_at: new Date().toISOString()
        }, { onConflict: 'user_id,room_id' });
    }
  };

  useEffect(() => {
    console.log('roomId', roomId);
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // まずroomIdでチャットルームを検索
      const { data: room } = await supabase
        .from('chat_rooms')
        .select('id, name')
        .eq('id', roomId)
        .single();

      // ルームが存在する場合
      if (room) {
        await fetchMessages(room.id);
        return;
      }

      // ルームが存在しない場合はDMとして新規作成
      const dmRoomName = `DM_${[user.id, roomId].sort().join('_')}`;
      
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({ name: dmRoomName })
        .select('id')
        .single();

      console.log('newRoom', newRoom);

      if (roomError) {
        console.error('Error creating chat room:', roomError);
        return;
      }

      // 両ユーザーをルームメンバーとして追加
      await supabase
        .from('room_members')
        .insert([
          { 
            user_id: user.id, 
            room_id: newRoom.id,
            last_read_at: new Date().toISOString()
          },
          { 
            user_id: roomId, 
            room_id: newRoom.id,
            last_read_at: new Date().toISOString()
          }
        ]);

      await fetchMessages(newRoom.id);
    };

    initializeChat();

    // リアルタイムサブスクリプション
    const subscription = supabase
      .channel('chat_messages_room')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoomId}`
      }, () => {
        if (currentRoomId) {
          fetchMessages(currentRoomId);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Realtime subscription successful in ChatRoom");
        } else {
          console.error("Realtime subscription error in ChatRoom:", status);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <pre>{JSON.stringify(message, null, 2)}</pre>
            </div>
          ))}
        </div>
      </ScrollArea>
      {currentRoomId && <MessageForm roomId={currentRoomId} />}
    </div>
  );
}