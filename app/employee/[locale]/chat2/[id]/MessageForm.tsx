"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";

interface MessageFormProps {
  roomId: string;
}

export default function MessageForm({ roomId }: MessageFormProps) {
  const supabase = createClient();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { id: recipientId } = useParams();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // メッセージを送信
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: message.trim()
        });

      if (messageError) throw messageError;
      setMessage("");

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.messagePlaceholder')}
          className="flex-1 min-h-[2.5rem] max-h-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className="self-end"
        >
          {t('chat.send')}
        </Button>
      </div>
    </form>
  );
}