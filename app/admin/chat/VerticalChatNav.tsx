"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MessageCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface ChatSpace {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function VerticalChatNav() {
  const supabase = createClient();
  const { userId, locale } = useParams();
  const pathname = usePathname();
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`chat.${key}`);

  useEffect(() => {
    const fetchChatSpaces = async () => {
      const  {data: {user}, error: userError} = await supabase.auth.getUser(); 
      if(userError || !user){
        console.error('Error fetching users:', userError);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, english_name, japanese_name, image_url")
        .neq("user_id", user.id)
        .order('english_name', { ascending: true }); //とりあえず名前の順

      if (error) {
        console.error("Error fetching chat spaces:", error);
        return;
      }

      const spaces: ChatSpace[] = [
        {
          id: "group",
          name: "グループチャット",
        },
        ...(data?.map((profile) => ({
          id: profile.user_id,
          name: `${profile.english_name || profile.japanese_name}`,
          imageUrl: profile.image_url,
        })) || []),
      ];

      setChatSpaces(spaces);
    };

    fetchChatSpaces();
  }, []);

  return (
    <nav className="h-full w-full sm:border-r-[2px]">
      <ScrollArea className="h-full">
        <div className="xs:pb-4 pb-10 md:px-2">
          <h2 className="text-lg font-semibold px-3 lg:px-4 pt-4 pb-1">
            チャット
          </h2>
          {chatSpaces.map((space) => (
            <Link
              key={space.id}
              href={`/admin/chat/${space.id}`}
              className={`flex items-center pl-4 xs:pr-4 pr-6 sm:px-2 lg:px-3 py-2.5 transition-colors md:rounded-lg ${
                userId === space.id || pathname === `/admin/chat/${space.id}`
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-200"
              }`}
            >
              {space.id === "group" ? (
                <div className="w-10 h-10 rounded-full mr-3 sm:mr-2 bg-blue-500 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
              ) : (
                <Avatar className="w-10 h-10 mr-3 sm:mr-2.5">
                  <AvatarImage src={space.imageUrl} alt={space.name} className="object-cover"/>
                  <AvatarFallback>{space.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0 mr-1">
                <p className="xs:text-lg ont-medium text-gray-900 truncate">{space.name}</p>
              </div>
              <MessageCircle className="text-gray-400 h-5 w-5 sm:h-4 sm:w-4"  />
            </Link>
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
}
