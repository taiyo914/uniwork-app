"use client";
import React from "react";
import { useParams } from "next/navigation";
import VerticalChatNav from "../../employee/[locale]/chat/VerticalChatNav";
import ChatDisplay from "../../employee/[locale]/chat/DirectChat";

export default function ChatUserPage() {
  const { userId } = useParams(); // userIdを取得

  return (
    <div className="flex h-screen">
      {/* チャットスペースナビゲーション */}
      <div className="max-w-60 w-full hidden sm:block ">
        <VerticalChatNav />
      </div>

      {/* 選択されたチャットスペースの表示エリア */}
      <div className=" w-full h-full p-4 overflow-auto">
        <ChatDisplay userId={userId as string} />
      </div>
    </div>
  );
}
