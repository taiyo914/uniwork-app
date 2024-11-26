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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .rpc('get_room_messages', {
        p_room_id: roomId
      });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);

    // 既読を更新
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('room_members')
        .upsert({
          user_id: user.id,
          room_id: roomId,
          last_read_at: new Date().toISOString()
        }, { onConflict: 'user_id,room_id' });
    }
  };

  useEffect(() => {
    fetchMessages();

    // リアルタイムサブスクリプション
    const subscription = supabase
      .channel('chat_messages_room')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, fetchMessages)
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
  }, [roomId]);

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
      <MessageForm roomId={roomId as string} />
    </div>
  );
}