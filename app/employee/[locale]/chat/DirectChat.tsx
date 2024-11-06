"use client"

import { supabase } from "@/utils/supabase/client";
import { Send, SmilePlus, Languages, Loader2, ArrowLeft } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useParams, useRouter } from "next/navigation";

interface Message {
  sender_id: string;
  receiver_id: string;
  message_id: number;
  content: string;
  created_at: string;
  reactions: Reaction[];
}

interface Reaction {
  target_id: number;
  reaction_id: number;
  user_id: string;
  reaction_type: string;
}

interface Profile {
  image_url: string;
  english_name: string;
}

const REACTION_TYPES = ["👍", "🙏", "🙇‍♂️", "😊", "😢", "😲", "😂"];

export default function DirectChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const prevMessageCount = useRef(messages.length);
  const router = useRouter();
  const { locale, userId: chatPartnerId } = useParams();

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

  const fetchCurrentUserId = useCallback(async () => {
    if (currentUserId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  }, [currentUserId]);

  const fetchPartnerProfile = useCallback(async () => {
    if (!chatPartnerId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('image_url, english_name')
      .eq('user_id', chatPartnerId)
      .single();

    if (error) {
      console.error("Error fetching partner profile:", error);
    } else {
      setPartnerProfile(data);
    }
  }, [chatPartnerId]);

  const setupRealtimeListeners = useCallback(() => {
    const messageSubscription = supabase
      .channel('direct-chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${currentUserId}` }, handleNewMessage)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${chatPartnerId}` }, handlePartnerNewMessage)
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
      supabase.removeChannel(messageSubscription);
    };
  }, [currentUserId, chatPartnerId]);

  useEffect(() => {
    console.log("Initializing DirectChat");
    fetchCurrentUserId();
    fetchPartnerProfile();
    fetchMessages();
  }, [currentUserId, chatPartnerId, fetchCurrentUserId, fetchPartnerProfile]);

  useEffect(() => {
    if (!currentUserId || !chatPartnerId) return;
    console.log("Setting up realtime listeners");
    const unsubscribe = setupRealtimeListeners();
    return () => {
      unsubscribe();
    };
  }, [currentUserId, chatPartnerId, setupRealtimeListeners]);

  const fetchMessages = async () => {
    if (!currentUserId || !chatPartnerId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        reactions (
          reaction_id,
          user_id,
          reaction_type,
          target_id
        )
      `)
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    setMessages(data || []);
  };

  const handleNewMessage = (payload: any) => {
    console.log("New message received:", payload);
    const newMessage = {
      ...payload.new as Message,
      reactions: [],
    };
    setMessages((currentMessages) => [...currentMessages, newMessage]);
  };

  const handlePartnerNewMessage = (payload: any) => {
    console.log("Partner's new message received:", payload);
    const partnersNewMessage = payload.new as Message;
    if (partnersNewMessage.receiver_id === currentUserId) {
      const newMessage = {
        ...partnersNewMessage,
        reactions: [],
      };
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    }
  };

  const handleNewReaction = (payload: any) => {
    console.log("New reaction received:", payload);
    const newReaction = payload.new as Reaction;
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.message_id === newReaction.target_id
          ? { ...message, reactions: [...message.reactions, newReaction] }
          : message
      )
    );
  };

  const handleDeleteReaction = (payload: any) => {
    console.log("Reaction deleted:", payload);
    const deletedReaction = payload.old as Reaction;
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.message_id === deletedReaction.target_id
          ? { ...message, reactions: message.reactions.filter(r => r.reaction_id !== deletedReaction.reaction_id) }
          : message
      )
    );
  };

  const handleUpdateReaction = (payload: any) => {
    console.log("Reaction updated:", payload);
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

    const { error } = await supabase.from('messages').insert([
      {
        sender_id: currentUserId,
        receiver_id: chatPartnerId,
        content: newMessage,
        is_group_message: false
      },
    ]);
    console.log("Message sent");
    if (error) console.error("Error sending message:", error);
    setNewMessage('');
  };

  const handleToggleReaction = async (messageId: number, reactionType: string) => {
    const currentReaction = messages
      .find(message => message.message_id === messageId)
      ?.reactions.find(reaction => reaction.user_id === currentUserId);

    if (currentReaction) {
      if (currentReaction.reaction_type === reactionType) {
        await supabase.from('reactions').delete().eq('reaction_id', currentReaction.reaction_id);
      } else {
        await supabase.from('reactions').update({ reaction_type: reactionType }).eq('reaction_id', currentReaction.reaction_id);
      }
    } else {
      await supabase.from('reactions').insert([
        { user_id: currentUserId, target_id: messageId, reaction_type: reactionType },
      ]);
    }
  };

  return (
    <div className="flex flex-col notxs:h-screen w-full bg-gray-50 relaitve xs:fixed xs:top-[3.5rem] xs:bottom-[3.3rem] ">
      <div className="bg-blue-100 shadow-sm pl-2 pr-3 sm:px-4 py-2.5 md:py-3.5 border-b border-blue-200 flex items-center justify-between abusolute top-0 left-0 w-full ">
        <button onClick={() => router.push(`/employee/${locale}/chat`)} className="flex items-center space-x-0.5 text-blue-500 sm:hidden py-1 px-1 rounded-lg hover:bg-blue-200 transition">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold ">戻る</span>
        </button>
        <h2 className="text-xl xs:font-semibold font-bold text-blue-700 flex items-center gap-2">{partnerProfile?.english_name}</h2>
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
              currentUserId={currentUserId!}
              partnerProfile={partnerProfile}
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
  currentUserId: string;
  partnerProfile: Profile | null;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, handleToggleReaction, currentUserId, partnerProfile}) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { locale } = useParams()
  const targetLang = Array.isArray(locale) ? locale[0] : locale;

  const reactionCounts: ReactionCounts = message.reactions.reduce((acc: ReactionCounts, reaction: Reaction) => {
    if (!acc[reaction.reaction_type]) acc[reaction.reaction_type] = 0;
    acc[reaction.reaction_type]++;
    return acc;
  }, {});

  const getUserProfilesByReaction = (reactionType: string): { name: string, imageUrl: string }[] => {
    return message.reactions
      .filter((reaction) => reaction.reaction_type === reactionType)
      .map((reaction) => ({
        name: reaction.user_id,
        imageUrl: ''
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

  const isCurrentUserMessage = message.sender_id === currentUserId;

  return (
    <div className={`px-2 sm:px-2 md:px-3 py-1 `}>
      <div className="flex items-start mb-0.5">
        {!isCurrentUserMessage && partnerProfile && (
          <Avatar className="h-8 w-8 mr-1 mt-1.5">
            <AvatarImage src={partnerProfile.image_url } alt="Partner Avatar" className="object-cover"/>
            <AvatarFallback>{partnerProfile.english_name[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className={`flex-grow ${isCurrentUserMessage ? 'order-2' : 'order-1'}`}>
         
          <div className={`flex gap-1 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}>

            {isCurrentUserMessage && (
              <div 
                className="border p-1 rounded-lg rounded-br-none h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center mt-[1.05rem] transition-all hover:bg-blue-100"
              >
                {isLoading ? (
                  <Loader2 className={`animate-spin sm:h-5 sm:w-5 h-[1.1rem] w-[1.1rem] text-blue-500`} />
                ) : (
                  <button onClick={handleTranslate}>
                    <Languages className="text-blue-500 sm:h-5 sm:w-5 h-[1.1rem] w-[1.1rem]" />
                  </button>
                )}
              </div>
            )}

            <div className="max-w-[87%] md:max-w-[70%]">
              <div className={`text-xs text-gray-400 ml-1 font-light font-sans ${isCurrentUserMessage ? 'text-right mr-0.5' : ''}`}>
                {format(message.created_at, "MM/dd HH:mm")}
              </div>
              <div className={`bg-white p-2 rounded-xl ${isCurrentUserMessage ? 'rounded-tr-none' : 'rounded-tl-none'} border inline-block  group relative hover:cursor-pointer`}>
                {message.content}
                {translatedText && (
                  <div className="text-gray-500 mt-1.5 border-t pt-1.5 px-0.5">{translatedText}</div>
                )}
                <div className={`absolute top-full ${isCurrentUserMessage ? 'right-0' : 'left-0'} hidden group-hover:block w-[13.6rem] z-10`}>
                  <div className={`bg-white border border-gray-200 rounded-md shadow-lg p-1 space-x-1`}>
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

            {!isCurrentUserMessage && (
              <div 
                className="border p-1 rounded-lg rounded-bl-none h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center mt-[1.05rem] transition-all hover:bg-blue-100"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin text-blue-500 sm:h-5 sm:w-5 h-[1.1rem] w-[1.1rem]" />
                ) : (
                  <button onClick={handleTranslate}>
                    <Languages className="text-blue-500 sm:h-5 sm:w-5 h-[1.1rem] w-[1.1rem]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {Object.keys(reactionCounts).length > 0 && (
        <div className={`flex flex-wrap gap-2 items-center ${isCurrentUserMessage ? 'mr-0.5 justify-end' : 'ml-10 justify-start'} mt-1 mb-1`}>
          {Object.entries(reactionCounts).map(([reactionType, count]) => {
            const userReacted = message.reactions.some(
              (reaction) => reaction.reaction_type === reactionType && reaction.user_id === currentUserId
            )
            const userProfiles = getUserProfilesByReaction(reactionType)

            return (
              <div key={reactionType} className="">
                <button
                  onClick={() => handleToggleReaction(message.message_id, reactionType)}
                  className={`text-sm border p-0.5 px-1.5 rounded-md 
                      ${userReacted ? "bg-blue-100/80 border-blue-300/80" : "border-gray-300/80"}
                    `}
                >
                  {reactionType} {count !== 1 && count}
                </button>
                
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};