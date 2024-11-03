"use client"

import { supabase } from "@/utils/supabase/client";
import { truncate } from "fs";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Message {
  sender_id: string;
  message_id: number;
  content: string;
  created_at: string;
  profiles: {
    japanese_name: string;
    english_name: string;
    image_url: string;
  };
  reactions: Reaction[];
}

interface Reaction {
  target_id: number;
  reaction_id: number;
  user_id: string;
  reaction_type: string;
}

export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(()=>{
    fetchMessages();
    setupRealtimeListeners()
  },[])

  const fetchMessages = async () => {
    const { data, error } = await supabase
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
          target_id
        )
      `)
      .eq('is_group_message', true)
      .order('created_at', { ascending: true });
    
    if (error) console.error(error);
    setMessages(data || []);
  };

  const setupRealtimeListeners = () => {
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'is_group_message=eq.true' }, handleNewMessage)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, handleNewReaction)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reactions' }, handleDeleteReaction)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reactions' }, handleUpdateReaction)
      .subscribe();

    return () => supabase.removeChannel(messageSubscription);
  };

    // 新しいメッセージ処理
    const handleNewMessage = async (payload:any) => {
      const newMessage = payload.new as Message;
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('japanese_name, english_name, image_url')
        .eq('user_id', newMessage.sender_id)
        .single();
  
      if (error) {
        console.error("Failed to fetch profile:", error);
        return;
      }
  
      const messageWithProfile = {
        ...newMessage,
        profiles: {
          japanese_name: profileData?.japanese_name,
          english_name: profileData?.english_name,
          image_url: profileData?.image_url || ""
        },
        reactions: [],
      };
      setMessages((currentMessages) => [...currentMessages, messageWithProfile]);
    };
  
    // 新しいリアクション処理
    const handleNewReaction = (payload:any) => {
      const newReaction = payload.new as Reaction;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.message_id === newReaction.target_id
            ? { ...message, reactions: [...message.reactions, newReaction] }
            : message
        )
      );
    };
  
    // リアクション削除処理
    const handleDeleteReaction = (payload:any) => {
      const deletedReaction = payload.old as Reaction;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.message_id === deletedReaction.target_id
            ? { ...message, reactions: message.reactions.filter(r => r.reaction_id !== deletedReaction.reaction_id) }
            : message
        )
      );
    };
  
    // リアクション更新処理
    const handleUpdateReaction = (payload:any) => {
      const updatedReaction = payload.new as Reaction;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.message_id === updatedReaction.target_id
            ? {
                ...message,
                reactions: message.reactions.map((reaction) =>
                  reaction.reaction_id === updatedReaction.reaction_id ? updatedReaction : reaction
                ),
              }
            : message
        )
      );
    };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error("Failed to get user (chat/handleSendMessage)");
      return;
    }

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: user.id, 
        receiver_id: user.id, 
        content: newMessage,
        is_group_message: true
      },
    ]);

    if (error) console.error(error);
    setNewMessage('');
  };

  const handleToggleReaction = async (messageId: number, reactionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("Failed to get user (chat/handleToggleReaction)");
      return;
    }

    // 現在のリアクションを取得
    const currentReaction = messages
      .find(message => message.message_id === messageId)
      ?.reactions.find(reaction => reaction.user_id === user.id);

    if (currentReaction) {
      // 既存のリアクションが同じタイプの場合は削除
      if (currentReaction.reaction_type === reactionType) {
        await supabase.from('reactions').delete().eq('reaction_id', currentReaction.reaction_id);
      } else {
        // 異なるリアクションタイプなら更新
        await supabase
          .from('reactions')
          .update({ reaction_type: reactionType })
          .eq('reaction_id', currentReaction.reaction_id);
      }
    } else {
      // リアクションが存在しなければ新規追加
      await supabase.from('reactions').insert([
        {
          user_id: user.id,
          target_id: messageId,
          reaction_type: reactionType,
        },
      ]);
    }
  };

  const MessageComponent = ({ message }:{message: Message}) => (
    <div className="p-4 bg-white border rounded shadow">
      <div className="flex items-center space-x-2">
        <img src={message.profiles?.image_url || '/default-avatar.png'} alt="User Avatar" className="w-10 h-10 rounded-full" />
        <p>{message.profiles?.japanese_name || message.profiles?.english_name}</p>
        <span className="text-gray-500 text-sm ml-2">{message.created_at}</span>
      </div>
      <p>{message.content}</p>
      <div className="mt-2 flex space-x-2">
        {message.reactions.map((reaction) => (
          <span key={reaction.reaction_id} className="text-sm text-gray-600">{reaction.reaction_type}</span>
        ))}
      </div>
      <div className="mt-2 flex space-x-2">
        <button onClick={() => handleToggleReaction(message.message_id, "good")} className="text-sm text-gray-600">👍 いいね</button>
        <button onClick={() => handleToggleReaction(message.message_id, "smile")} className="text-sm text-gray-600">😊 笑顔</button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">全体チャット</h2>
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => <MessageComponent key={message.message_id} message={message} />)}
        </div>
        <div className="flex items-center border-t p-4">
          <input
            type="text"
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded p-2 mr-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">送信</button>
        </div>
      </div>
    </div>
  )
}
