"use client"

import { supabase } from "@/utils/supabase/client";
import { Send, SmilePlus, Languages, Loader2, ChevronLeft, ChevronRight, ArrowLeft, Users } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { translateText } from '@/utils/translate';
import { useTranslation } from "react-i18next";

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

export default function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true); 
  const prevMessageCount = useRef(messages.length);
  const router = useRouter();
  const { locale } = useParams();
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

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

  const handleNewMessage = useCallback(async (payload: any) => {
    console.log('handleNewMessage called with payload:', payload);
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
    setMessages((currentMessages) => {
      return [...currentMessages, messageWithProfile];
    });
  }, []);

  const handleNewReaction = useCallback(async (payload: any) => {
    console.log('handleNewReaction called with payload:', payload);
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
  }, []);

  const handleDeleteReaction = useCallback((payload: any) => {
    console.log('handleDeleteReaction called with payload:', payload);
    const deletedReaction = payload.old as Reaction;
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.message_id === deletedReaction.target_id
          ? { ...message, reactions: message.reactions.filter(r => r.reaction_id !== deletedReaction.reaction_id) }
          : message
      )
    );
  }, []);

  const handleUpdateReaction = useCallback(async (payload: any) => {
    console.log('handleUpdateReaction called with payload:', payload);
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
  }, []);

  const fetchUserId = useCallback(async () => {
    if(userId) return;
    console.log('fetchUserId called, current userId:', userId);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('Setting new userId:', user.id);
      setUserId(user.id);
    }
  }, [userId]);

  const fetchMessages = useCallback(async () => {
    console.log('fetchMessages called');
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
    
    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  }, []);

  const setupRealtimeListeners = useCallback(() => {
    console.log('Setting up realtime listeners');
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'is_group_message=eq.true' }, handleNewMessage)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, handleNewReaction)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reactions' }, handleDeleteReaction)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reactions' }, handleUpdateReaction)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Realtime subscription successful");
        } else {
          console.error("Realtime subscription error:", status);
        }
      });

    return () => {
      console.log('Cleaning up realtime listeners');
      supabase.removeChannel(messageSubscription);
    };
  }, [handleNewMessage, handleNewReaction, handleDeleteReaction, handleUpdateReaction]);

  useEffect(() => {
    fetchUserId();
    fetchMessages();
  }, [fetchUserId, fetchMessages]);

  useEffect(() => {
    const cleanup = setupRealtimeListeners();
    return () => {
      cleanup();
    };
  }, [setupRealtimeListeners]); 

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      if (bottomRef.current) {
        scrollToBottom();
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: userId, 
        receiver_id: userId, 
        content: newMessage,
        is_group_message: true
      },
    ]);

    if (error) console.error(error);
    setNewMessage('');
  };

  const handleToggleReaction = async (messageId: number, reactionType: string) => {

    const currentReaction = messages
      .find(message => message.message_id === messageId)
      ?.reactions.find(reaction => reaction.user_id === userId);

    if (currentReaction) {
      if (currentReaction.reaction_type === reactionType) {
        await supabase.from('reactions').delete().eq('reaction_id', currentReaction.reaction_id);
      } else {
        await supabase.from('reactions').update({ reaction_type: reactionType }).eq('reaction_id', currentReaction.reaction_id);
      }
    } else {
      await supabase.from('reactions').insert([
        {user_id: userId, target_id: messageId, reaction_type: reactionType,},
      ]);
    }
  };

  return (
    <div className="flex flex-col notxs:h-screen w-full bg-gray-50 relaitve xs:fixed xs:top-[3.5rem] xs:bottom-[3.3rem] ">
      <div className="bg-blue-100 shadow-sm pl-2 pr-3 sm:px-4 py-2.5 md:py-3.5 border-b border-blue-200 flex items-center justify-between abusolute top-0 left-0 w-full ">
        <button onClick={() => router.push(`/employee/${locale}/chat`)} className="flex items-center space-x-0.5 text-blue-500 sm:hidden py-1 px-1 rounded-lg hover:bg-blue-200 transition">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold ">{t('back')}</span>
        </button>
        <h2 className="text-xl xs:font-semibold font-bold text-blue-700 flex items-center gap-2">
          <Users className="" size={20} />{t('groupChat')}
        </h2>
      </div>

      <div 
        className="flex-grow overflow-auto pb-7"
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
      <div className="bg-white border-t p-3 abusolute bottom-0 left-0 w-full">
        <div className="">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={t('messagePlaceholder')}
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
  const { locale } = useParams();
  const targetLang = Array.isArray(locale) ? locale[0] : locale;
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);
  
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
      const translatedText = await translateText(message.content, targetLang);
      if (translatedText) {
        setTranslatedText(translatedText);
      } else {
        setTranslatedText(t('translationFailed'));
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText(t('translationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pr-2 sm:pr-1 md:pr-3 pl-3 sm:pl-2 md:pl-3 py-2 ">
      <div className="flex items-start mb-2">
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarImage src={message.profiles?.image_url } alt="User Avatar" />
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
              <span className="text-xs font-semibold"> {t('addReaction')}</span>
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