"use client"

import { supabase } from "@/utils/supabase/client";
import { Send, SmilePlus, Languages, Loader2, ArrowLeft } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { useParams, useRouter } from "next/navigation";
import { translateText } from '@/utils/translate'; 
import { useTranslation } from "react-i18next";

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
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

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
  }, [currentUserId, chatPartnerId,setupRealtimeListeners ]); 

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
          <span className="text-sm font-semibold ">{t('back')}</span>
        </button>
        <h2 className="text-xl xs:font-semibold font-bold text-blue-700 flex items-center gap-2">{partnerProfile?.english_name}</h2>
      </div>

      <div 
        className="flex-grow overflow-auto pb-8"
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
  currentUserId: string;
  partnerProfile: Profile | null;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, handleToggleReaction, currentUserId, partnerProfile}) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const { locale } = useParams();
  const targetLang = Array.isArray(locale) ? locale[0] : locale;
  const isCurrentUserMessage = message.sender_id === currentUserId;
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

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

  const handleReactionClick = () => {
    setIsReactionMenuOpen(!isReactionMenuOpen);
  };

  const handleReactionSelect = (messageId: number, reactionType: string) => {
    handleToggleReaction(messageId, reactionType);
    setIsReactionMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isReactionMenuOpen &&
        reactionMenuRef.current &&
        !reactionMenuRef.current.contains(event.target as Node) &&
        reactionButtonRef.current &&
        !reactionButtonRef.current.contains(event.target as Node)
      ) {
        setIsReactionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isReactionMenuOpen]);

  return (
    <div className={`px-2 sm:px-2 md:px-3 py-1`}>
      <div className="flex items-start mb-0.5">
        {!isCurrentUserMessage && partnerProfile && (
          <Avatar className="h-8 w-8 mr-1 mt-1.5">
            <AvatarImage src={partnerProfile.image_url} alt="Partner Avatar" className="object-cover"/>
            <AvatarFallback>{partnerProfile.english_name[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className={`flex-grow ${isCurrentUserMessage ? 'order-2' : 'order-1'}`}>
          <div className={`flex gap-1 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}>
            {isCurrentUserMessage && <div className="w-12"></div>}
            
            <div className="max-w-[87%] md:max-w-[70%] relative">
              <div className={`text-xs text-gray-400 ml-1 font-light font-sans ${isCurrentUserMessage ? 'text-right mr-0.5' : ''}`}>
                {format(message.created_at, "MM/dd HH:mm")}
              </div>
              <div className="relative group">
                <div className={`bg-white p-2 rounded-xl ${isCurrentUserMessage ? 'rounded-tr-none' : 'rounded-tl-none'} border inline-block hover:cursor-pointer`}>
                  {message.content}
                  {translatedText && (
                    <div className="text-gray-500 mt-1.5 border-t pt-1.5 px-0.5">{translatedText}</div>
                  )}
                </div>

                <div className={`absolute top-1/2 -translate-y-1/2 z-10 px-[0.2rem] gap-0.5 hidden group-hover:flex items-center
                  ${isCurrentUserMessage ? '-left-[3rem] flex-row-reverse' : '-right-[3rem]'}`}
                >
                  <button 
                    ref={reactionButtonRef}
                    onClick={handleReactionClick}
                    className="p-0.5 hover:bg-gray-100 rounded-full"
                  >
                    <SmilePlus className="h-4 w-4 text-gray-500/80" />
                  </button>
                  <button 
                    onClick={handleTranslate}
                    className="p-0.5 hover:bg-gray-100 rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <Languages className="h-4 w-4 text-gray-500/80" />
                    )}
                  </button>
                </div>

                {isReactionMenuOpen && (
                  <div 
                    ref={reactionMenuRef}
                    className={`absolute z-10 -mt-[1px] bg-white border rounded-lg shadow-lg p-1 flex gap-[0.2rem]
                      ${isCurrentUserMessage ? 'right-0' : 'left-0'}`}
                  >
                    {REACTION_TYPES.map((reaction) => (
                      <button
                        key={reaction}
                        onClick={() => handleReactionSelect(message.message_id, reaction)}
                        className="text-[1.1rem] hover:bg-gray-100 px-1 rounded"
                      >
                        {reaction}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!isCurrentUserMessage && <div className="w-12"></div>}
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