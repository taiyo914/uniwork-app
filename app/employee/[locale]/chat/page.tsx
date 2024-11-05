"use client"

import { supabase } from "@/utils/supabase/client";
import { Send, SmilePlus, Languages, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useParams } from "next/navigation";
import { useChatStore } from "@/stores/useChatStore";

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
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true); 
  const prevMessageCount = useRef(messages.length);
  const { isSidebarExpanded, toggleSidebar } = useChatStore()

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isFirstRender.current ? "instant" : "smooth"  });
      isFirstRender.current = false;
    }
  };

  useEffect(() => {
    if (messages.length > prevMessageCount.current) { // メッセージ数の変化を確認
      if (bottomRef.current) {
        scrollToBottom();
      }
    }
    prevMessageCount.current = messages.length; // メッセージ数を更新
  }, [messages.length]); 

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
  <div className="flex flex-col h-screen w-full bg-gray-50">
    <div className="bg-blue-100 shadow-sm p-4 border-b border-blue-200 flex">
      <button
        onClick={toggleSidebar}
        className="p-1 rounded-full hover:bg-gray-100 block sm:hidden"
        // aria-label={isSidebarExpanded ? t('collapse_sidebar') : t('expand_sidebar')}
      >
        {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      <h2 className="text-xl font-bold text-blue-700">全体チャット</h2>
    </div>

    <div 
      className="flex-grow overflow-auto pb-6"
    >
      <div className="">
        {messages.map((message) => (
          <MessageComponent
            key={message.message_id}
            message={message}
            handleToggleReaction={handleToggleReaction}
            userId={userId!}
          />
        ))}
      </div>
      <div ref={bottomRef} />
    </div>
    <div className="bg-white border-t p-3">
      <div className="">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="メッセージを入力..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow focus-visible:ring-1 focus-visible:ring-offset-2"
          />
          <Button type="submit" size="icon" className={` ${newMessage.trim() ? "bg-blue-500 hover:bg-blue-600 text-white":"bg-white text-gray-600 border hover:cursor-default"}`}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
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
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { locale } = useParams()
  const targetLang = Array.isArray(locale) ? locale[0] : locale;

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
          ? reaction.profiles.english_name || reaction.profiles.japanese_name || reaction.user_id
          : reaction.user_id,
        imageUrl: reaction.profiles?.image_url || '/default-avatar.png'
      }));
  };

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/translate?text=${encodeURIComponent(
          message.content
        )}&targetLang=${targetLang}&sourceLang=`
      );
      const data = await response.json();
      if (response.ok) {
        setTranslatedText(data.translatedText);
      } else {
        console.error('Translation error:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
      setTranslatedText("翻訳に失敗しました...");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-3 py-2 ">
      <div className="flex items-start mb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.profiles?.image_url || '/placeholder.svg?height=40&width=40'} alt="User Avatar" />
          <AvatarFallback>{message.profiles?.japanese_name?.[0] || message.profiles?.english_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="font-semibold text-blue-600 text-sm ml-2">
            {message.profiles?.english_name || message.profiles?.japanese_name}
            <span className="text-xs text-gray-400 ml-1 font-light">
              {format(message.created_at, "MM/dd HH:mm")}
            </span>
          </div>
          <div className="flex mt-0.5 gap-1">
            <div className=" bg-white p-2 rounded-xl rounded-tl-none border ml-1 flex-grow">
              {message.content}
              {translatedText && (
              <div className="text-gray-500 mt-1.5 border-t pt-1.5 px-0.5">{translatedText}</div>
            )}
            </div>
            <div 
              className="border p-1 rounded-lg rounded-bl-none h-8 w-8 flex items-center justify-center mt-[0.5px] transition-all hover:bg-blue-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-blue-500 h-5 w-5" />
              ) : (
                <button onClick={handleTranslate}>
                  <Languages className="text-blue-500 h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
  
      <div className="-mt-0.5 ml-10 flex flex-wrap gap-2 items-center">

        {Object.entries(reactionCounts).map(([reactionType, count]) => {
          const userReacted = message.reactions.some(
            (reaction) => reaction.reaction_type === reactionType && reaction.user_id === userId
          )
          const userProfiles = getUserProfilesByReaction(reactionType)

          return (
            <div key={reactionType} className="relative group">
              <button
                onClick={() => handleToggleReaction(message.message_id, reactionType)}
                className={`text-sm border p-0.5 px-1.5 rounded-md 
                    ${userReacted ? "bg-blue-100/80 border-blue-300/80" : "border-gray-300/80"}
                  `}
              >
                {reactionType} {count}
              </button>
              <div className="absolute bottom-full -left-0.5 mb-[0.17rem] p-1.5 pr-3 pl-2 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block w-fit space-y-1">
                {userProfiles.length > 0 ? (
                  userProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <Avatar className="h-6 w-6 border">
                        <AvatarImage src={profile.imageUrl} alt="User Avatar" className="object-cover"/>
                        <AvatarFallback>{profile.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="truncate mt-0.5 text-nowrap text-gray-500">{profile.name}</span>
                    </div>
                  ))
                ) : (
                  <div>ユーザーなし</div>
                )}
              </div>
            </div>
          )
        })}

        <div className={`relative group mt-0.5 ${Object.entries(reactionCounts).length === 0 && "ml-1 mt-0"}`}>
          <div className="flex items-center gap-1 group-hover:text-gray-500 text-gray-400 cursor-pointer">
            <SmilePlus className={`h-4 w-4`} />
            {Object.entries(reactionCounts).length === 0 && (
              <span className="text-xs font-semibold"> +リアクション</span>
            )}
          </div>

          <div className="absolute -left-2 top-0 mt-4 w-[13.6rem] bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:flex flex-wrap gap-1 py-0.5 p-1">
            {REACTION_TYPES.map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleToggleReaction(message.message_id, reaction)}
                className="text-lg hover:bg-gray-100 px-1 rounded inline"
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