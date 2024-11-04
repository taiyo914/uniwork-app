"use client"

import { supabase } from "@/utils/supabase/client";
import { PlusCircle } from "lucide-react";
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
  profiles: {
    japanese_name: string;
    english_name: string;
    image_url: string;
  };
}

const REACTION_TYPES = ["👍", "🙏", "🙇‍♂️", "😊", "😢", "😲", "😂"];

export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
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

  useEffect(()=>{
    fetchUserId();
    fetchMessages();
    setupRealtimeListeners()
  },[setupRealtimeListeners])

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
          target_id,
          profiles!reactions_user_id_fkey ( 
            japanese_name,
            english_name,
            image_url
          )
        )
      `)
      .eq('is_group_message', true)
      .order('created_at', { ascending: true });
    
    if (error) console.error(error);
    setMessages(data || []);
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
  const handleNewReaction = async (payload:any) => {
    const newReaction = payload.new as Reaction;
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('japanese_name, english_name, image_url')
      .eq('user_id', newReaction.user_id)
      .single();
    
    if (error) {
      console.error("Failed to fetch profile for reaction:", error);
      return;
    }

    const completeReaction = {
      ...newReaction,
      profiles: {
        japanese_name: profileData?.japanese_name,
        english_name: profileData?.english_name,
        image_url: profileData?.image_url || ""
      }
    };

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.message_id === newReaction.target_id
          ? { ...message, reactions: [...message.reactions, completeReaction] }
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
  const handleUpdateReaction = async (payload:any) => {
    const updatedReaction = payload.new as Reaction;

    // profilesテーブルからユーザー情報を取得
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('japanese_name, english_name, image_url')
      .eq('user_id', updatedReaction.user_id)
      .single();

    if (error) {
      console.error("Failed to fetch profile for reaction:", error);
      return;
    }

    const completeReaction = {
      ...updatedReaction,
      profiles: {
        japanese_name: profileData?.japanese_name,
        english_name: profileData?.english_name,
        image_url: profileData?.image_url || ""
      }
    };

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.message_id === updatedReaction.target_id
          ? {
              ...message,
              reactions: message.reactions.map((reaction) =>
                reaction.reaction_id === updatedReaction.reaction_id ? completeReaction : reaction
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

    const currentReaction = messages
      .find(message => message.message_id === messageId)
      ?.reactions.find(reaction => reaction.user_id === user.id);

    if (currentReaction) {
      if (currentReaction.reaction_type === reactionType) {
        await supabase.from('reactions').delete().eq('reaction_id', currentReaction.reaction_id);
      } else {
        await supabase.from('reactions').update({ reaction_type: reactionType }).eq('reaction_id', currentReaction.reaction_id);
      }
    } else {
      await supabase.from('reactions').insert([
        {user_id: user.id, target_id: messageId, reaction_type: reactionType,},
      ]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">全体チャット</h2>
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) =>( 
            <MessageComponent key={message.message_id} message={message} handleToggleReaction={handleToggleReaction} userId={userId!} />))}
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

interface ReactionCounts {
  [reactionType: string]: number;
}

interface MessageComponentProps {
  message: Message;
  handleToggleReaction: (messageId: number, reactionType: string) => void;
  userId: string;  // 現在のユーザーIDを追加
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, handleToggleReaction, userId}) => {
  // リアクションのカウントを計算
  const reactionCounts: ReactionCounts = message.reactions.reduce((acc: ReactionCounts, reaction: Reaction) => {
    if (!acc[reaction.reaction_type]) acc[reaction.reaction_type] = 0;
    acc[reaction.reaction_type]++;
    return acc;
  }, {});

  const getUserProfilesByReaction = (reactionType: string): { name: string, imageUrl: string }[] => {
    return message.reactions
      .filter((reaction) => reaction.reaction_type === reactionType)
      .map((reaction) => ({
        name: reaction.profiles
          ? reaction.profiles.japanese_name || reaction.profiles.english_name || reaction.user_id
          : reaction.user_id,
        imageUrl: reaction.profiles?.image_url || '/default-avatar.png'
      }));
  };

  return (
    <div className="p-4 bg-white border rounded shadow">
      <div className="flex items-center space-x-2">
        <img src={message.profiles?.image_url || '/default-avatar.png'} alt="User Avatar" className="w-10 h-10 rounded-full" />
        <p>{message.profiles?.japanese_name || message.profiles?.english_name}</p>
        <span className="text-gray-500 text-sm ml-2">{new Date(message.created_at).toLocaleString()}</span>
      </div>
      <p>{message.content}</p>
      <div className="mt-2 flex space-x-2">
        {/* リアクションとカウントの表示 */}
        {Object.entries(reactionCounts).map(([reactionType, count]) => {
          const userReacted = message.reactions.some(
            (reaction) => reaction.reaction_type === reactionType && reaction.user_id === userId
          );
          const userProfiles = getUserProfilesByReaction(reactionType);

          return (
            <div className="relative group" key={reactionType}>
              <button
                onClick={() => handleToggleReaction(message.message_id, reactionType)}
                className={`text-sm flex items-center space-x-1 ${
                  userReacted ? 'text-blue-500 border border-blue-500 p-1 rounded' : 'text-gray-600'
                }`}
              >
                <span>{reactionType}</span>
                <span>{count}</span>
              </button>
              {/* ユーザー名とアイコンのホバーメニュー */}
              <div className="absolute bottom-full left-0 mb-1 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs hidden group-hover:flex flex-wrap gap-2 w-48">
                {userProfiles.length > 0 ? (
                  userProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <img src={profile.imageUrl} alt="User Avatar" className="w-6 h-6 rounded-full" />
                      <span>{profile.name}</span>
                    </div>
                  ))
                ) : (
                  <div>ユーザーなし</div>
                )}
              </div>

            </div>
          );
        })}

        <div className="relative group">
          <button className="text-sm text-gray-600 flex items-center space-x-1">
            <PlusCircle/>
          </button>
          {/* スタンプ選択メニュー */}
          <div className="absolute left-0 top-full bg-white border border-gray-300 rounded shadow-lg hidden group-hover:flex space-x-2 z-10">
            {REACTION_TYPES.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleToggleReaction(message.message_id, reaction)}
                className="text-lg"
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};