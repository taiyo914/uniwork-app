import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, UtensilsCrossed, Info, Heart, MessageCircle, Pencil, Loader2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { translateJson } from "@/utils/translateJson"

interface TeamMember {
  user_id: string
  english_name: string
  nationality: string
  languages: string
  shared_info: string
  favorite_foods: string
  dietary_restrictions: string
  hobbies: string
  image_url: string
  work_status: 'notStarted' | 'working' | 'onBreak'
  isTranslating?: boolean;
}

interface MemberCardProps {
  member: TeamMember
  locale: string
  userId?: string
  onChatClick: (userId: string) => void
}

const getBadgeStyle = (workStatus: string) => {
  if (workStatus === "working") return "border border-green-400 bg-green-100 text-green-800 px-3 py-1 text-xs"
  if (workStatus === "onBreak") return "border border-yellow-400 bg-yellow-100 text-yellow-800 px-3 py-1 text-xs"
  if (workStatus === "notStarted") return "border border-gray-300 bg-blue-100 text-gray-400 px-3 py-1 text-xs"
}

const getAvatarBorder = (workStatus: string) =>{
  if (workStatus === "working") return "ring-4 ring-green-400"
  if (workStatus === "onBreak") return "ring-4 ring-amber-300"
  if (workStatus === "notStarted") return "ring-2 ring-blue-200"
}

const getHeaderColor = (workStatus: string) =>{
  if (workStatus === "working") return "bg-green-100 border-b border-green-300"
  if (workStatus === "onBreak") return "bg-yellow-100 border-b border-yellow-300"
  if (workStatus === "notStarted") return "bg-blue-100 border-b border-blue-200"
}

const getTextColor = (workStatus: string) =>{
  if (workStatus === "working") return "text-green-800"
  if (workStatus === "onBreak") return "text-amber-800"
  if (workStatus === "notStarted") return "text-blue-800"
}


export function MemberCard({ member, locale = "ja", userId, onChatClick }: MemberCardProps) {
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<{
    languages: string;
    shared_info: string;
    favorite_foods: string;
    dietary_restrictions: string;
    hobbies: string;
  } | null>(null);
  const [showTranslated, setShowTranslated] = useState(false);

  const getBadgeLabel = (workStatus: string) => {
    if (workStatus === "working") return "勤務中";
    if (workStatus === "onBreak") return "休憩中";
    if (workStatus === "notStarted") return "未出勤";
  }

  const handleTranslate = async () => {
    if (translatedData) {
      setShowTranslated(!showTranslated);
      return;
    }

    setIsTranslating(true);
    const dataToTranslate = {
      languages: member.languages,
      shared_info: member.shared_info,
      favorite_foods: member.favorite_foods,
      dietary_restrictions: member.dietary_restrictions,
      hobbies: member.hobbies
    };

    try {
      const translated = await translateJson(locale, dataToTranslate);
      if (translated) {
        setTranslatedData(translated as any);
        setShowTranslated(true);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const displayData = showTranslated && translatedData ? translatedData : member;

  return (
    <Card className="overflow-hidden border shadow-lg relative pb-9">
      <CardHeader className={`py-4 ${getHeaderColor(member.work_status)} pr-4 transition-all duration-500`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className={`w-12 h-12 ${getAvatarBorder(member.work_status)} transition-all duration-500`}>
              <AvatarImage src={member.image_url} alt={member.english_name} className="object-cover" />
              <AvatarFallback className={`bg-blue-200 text-blue-800`}>{member.english_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={`text-xl text-foreground`}>{member.english_name}</CardTitle>
              <p className={`text-sm text-muted-foreground`}>{member.nationality}</p>
            </div>
          </div>
          <div className="">
            <Badge className={`${getBadgeStyle(member.work_status)} transition-all duration-500`}>{getBadgeLabel(member.work_status)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-white pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">言語 : </span>
            <span className={`text-sm ${showTranslated ? 'text-blue-600' : ''}`}>{displayData.languages}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-sm">食事の好み</span>
            </div>
            <p className="text-sm pl-7">好きなもの: <span className={`${showTranslated ? 'text-blue-600' : ''}`}>{displayData.favorite_foods}</span></p>
            {displayData.dietary_restrictions && (
              <p className="text-sm pl-7 text-gray-600">
                食べられないもの: <span className={`${showTranslated ? 'text-blue-500' : ''}`}>{displayData.dietary_restrictions}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-sm">好きなこと</span>
            </div>
            <p className={`text-sm pl-7 ${showTranslated ? 'text-blue-600' : ''}`}>{displayData.hobbies}</p>
          </div>
          {displayData.shared_info && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-sm">その他</span>
              </div>
              <p className={`text-sm pl-7 ${showTranslated ? 'text-blue-600' : ''}`}>{displayData.shared_info}</p>
            </div>
          )}
        </div>
      </CardContent>

      <div className="absolute bottom-3 flex justify-between w-full px-3">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-lg border border-gray-200 text-xs px-2 h-8 
            ${showTranslated ? 'text-blue-600 hover:bg-blue-100 hover:text-blue-600 bg-blue-50 border-blue-300' 
              : 'text-gray-500 hover:text-gray-700 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:hover:bg-gray-50 disabled:bg-gray-50'
            }
          `}
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-[0.85rem] h-[0.85rem] animate-spin text-blue-600" />
              翻訳中
            </>
          ) : (
            <>
              <Languages className={`w-[0.85rem] h-[0.85rem]`} />
              翻訳
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 rounded-lg border border-gray-200 text-xs px-2 h-8"
          onClick={() => onChatClick(member.user_id)}
        >
          {userId === member.user_id ? (
            <>
              <Pencil className="w-3.5 h-3.5 mb-0.5 " />
              編集
            </>
          ) : (
            <>
              <MessageCircle className="w-[0.85rem] h-[0.85rem] mb-0.5" />
              チャットへ
            </>
          )}
        </Button>
      </div>
    </Card>
  );

} 