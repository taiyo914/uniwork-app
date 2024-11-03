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
}

export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(()=>{
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            japanese_name,
            english_name,
            image_url
          )
        `)
        .eq('is_group_message', true) // グループチャットは receiver_id が null
        .order('created_at', { ascending: true });
        
      if (error) console.error(error);
      console.log(data)
      setMessages(data || []);
    };

    fetchMessages();
  },[])

  useEffect(() => {
    // リアルタイムメッセージの設定
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'is_group_message=eq.true',
        },
        async (payload) => {
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

          // プロファイル情報を新しいメッセージに追加してセット
          const messageWithProfile = {
            ...newMessage,
            profiles: {
              japanese_name: profileData?.japanese_name,
              english_name: profileData?.english_name,
              image_url: profileData?.image_url || ""
            },
          };
          setMessages((currentMessages) => [...currentMessages, messageWithProfile]);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [supabase, setMessages]);

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">全体チャット</h2>
      <div className="flex flex-col h-full">
        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.message_id} className="p-4 bg-white border rounded shadow">
              <div className="">
                {/* プロフィールから名前を表示 */}
                <img
                  src={message.profiles?.image_url || '/default-avatar.png'}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
                {/* <Image
                  src={message.profiles?.image_url || '/default-avatar.png'} // 画像のパス
                  alt="画像の説明"         // 代替テキスト
                  width={30}             // 表示する幅（ピクセル）
                  height={30}            // 表示する高さ（ピクセル）
                /> */}
                <p>{message.profiles?.japanese_name} </p>
                <p>{message.profiles?.english_name }</p>
                <p >{message.created_at}</p> 
              </div>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        {/* メッセージ入力フォーム */}
        <div className="flex items-center border-t p-4">
          <input
            type="text"
            placeholder="メッセージを入力..."
            className="flex-1 border border-gray-300 rounded p-2 mr-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
