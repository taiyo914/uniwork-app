"use client"
import React from "react";
import { MessageCircle } from "lucide-react"

//チャット全体に対する情報を教えてあげるでもいいな

export default function ChatPage() {

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
        <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/80 mb-4" />
        <div className="text-xl font-semibold text-muted-foreground/80 mb-2 text-center">チャットを選んでください</div>
        <div className="text-sm text-muted-foreground/80 text-center">
          左側のリストからチャットを選択してください
        </div>
    </div>
  );
}
