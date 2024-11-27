"use client"

import { supabase } from "@/utils/supabase/client";
import { Send } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageComponent } from "./MessageComponent";
import { useAuth } from "@/hooks/useAuth";

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
    english_name: string;
    japanese_name: string;
    image_url: string;
  }[];
}

export default function ChatRoom() {
  const { userId } = useAuth();
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const prevMessageCount = useRef(messages.length);
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

  // スクロール処理
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isFirstRender.current ? "instant" : "smooth" });
      isFirstRender.current = false;
    }
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      scrollToBottom();
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // メッセージ取得
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .rpc('get_room_messages', {
        p_room_id: roomId
      });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    scrollToBottom();
    
  }, [roomId, userId, scrollToBottom]);

  const updateLastRead = useCallback(async () => {
    if (!userId || !roomId) return;
    
    await supabase
      .from('room_members')
      .upsert({
        user_id: userId,
        room_id: roomId,
        last_read_at: new Date().toISOString()
      }, { onConflict: 'user_id,room_id' });
  }, [userId, roomId]);

  useEffect(() => {
    console.log("chatRoom roomId, userId", roomId, userId);
    if (!roomId || !userId) return;

    updateLastRead();
    fetchMessages();

    const subscription = supabase
      .channel('chat_room_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, () => {
        updateLastRead();
        fetchMessages();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_reactions'
      }, () => fetchMessages())
      .subscribe((status)=>{console.log(status)});

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, userId, updateLastRead, fetchMessages]);

  // メッセージ送信
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage,
        room_id: roomId,
        user_id: userId
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  // リアクション処理
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!userId) return;

    const { data: existingReaction } = await supabase
      .from('chat_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existingReaction) {
      await supabase
        .from('chat_reactions')
        .delete()
        .eq('id', existingReaction.id);
    } else {
      await supabase
        .from('chat_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji: emoji
        });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="pb-5">
          {messages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              currentUserId={userId!}
              handleToggleReaction={handleToggleReaction}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('messagePlaceholder')}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            className={newMessage.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200"}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}