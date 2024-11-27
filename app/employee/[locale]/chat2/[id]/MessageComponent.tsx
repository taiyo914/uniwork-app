import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SmilePlus, Languages, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { translateText } from '@/utils/translate';
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageProps {
  message: {
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
  };
  currentUserId: string;
  handleToggleReaction: (messageId: string, emoji: string) => void;
}

interface ReactionCounts {
  [emoji: string]: number;
}

const REACTION_TYPES = ["👍", "🙏", "🙇‍♂️", "😊", "😢", "😲", "😂"];

export function MessageComponent({ message, currentUserId, handleToggleReaction }: MessageProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const { locale } = useParams();
  const targetLang = Array.isArray(locale) ? locale[0] : locale;
  const isCurrentUserMessage = message.user_id === currentUserId;
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

  const reactionCounts: ReactionCounts = message.reactions.reduce((acc: ReactionCounts, reaction) => {
    if (!acc[reaction.emoji]) acc[reaction.emoji] = 0;
    acc[reaction.emoji]++;
    return acc;
  }, {});

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

  const handleReactionSelect = (messageId: string, emoji: string) => {
    handleToggleReaction(messageId, emoji);
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
        {!isCurrentUserMessage && (
          <Avatar className="h-8 w-8 mr-1 mt-1.5">
            <AvatarImage src={message.image_url} alt={message.english_name} className="object-cover"/>
            <AvatarFallback>{message.english_name[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className={`flex-grow ${isCurrentUserMessage ? 'order-2' : 'order-1'}`}>
          <div className={`flex gap-1 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}>
            {isCurrentUserMessage && <div className="w-12"></div>}
            
            <div className={`max-w-[87%] md:max-w-[70%] relative ${isCurrentUserMessage ? 'flex flex-col items-end' : ''}`}>
              <div className={`text-xs text-gray-400 ml-1 font-light font-sans ${isCurrentUserMessage ? 'text-right mr-0.5' : ''}`}>
                {format(new Date(message.created_at), "MM/dd HH:mm")}
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
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button 
                          ref={reactionButtonRef}
                          onClick={handleReactionClick}
                          className="p-0.5 hover:bg-gray-100 rounded-full"
                        >
                          <SmilePlus className="h-4 w-4 text-gray-500/80" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('addReaction')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>
                        {translate('member.translate')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isReactionMenuOpen && (
                  <div 
                    ref={reactionMenuRef}
                    className={`absolute z-10 -mt-[1px] bg-white border rounded-lg shadow-lg p-1 flex gap-[0.2rem]
                      ${isCurrentUserMessage ? 'right-0' : 'left-0'}`}
                  >
                    {REACTION_TYPES.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReactionSelect(message.id, emoji)}
                        className="text-[1.1rem] hover:bg-gray-100 px-1 rounded"
                      >
                        {emoji}
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
          {Object.entries(reactionCounts).map(([emoji, count]) => {
            const userReacted = message.reactions.some(
              (reaction) => reaction.emoji === emoji && reaction.user_id === currentUserId
            );

            return (
              <div key={emoji}>
                <button
                  onClick={() => handleToggleReaction(message.id, emoji)}
                  className={`text-sm border p-0.5 px-1.5 rounded-md 
                    ${userReacted ? "bg-blue-100/80 border-blue-300/80" : "border-gray-300/80"}
                  `}
                >
                  {emoji} {count !== 1 && count}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}