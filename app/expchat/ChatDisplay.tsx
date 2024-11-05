"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ChatDisplayProps {
  userId: string;
}

export default function ChatDisplay({ userId }: ChatDisplayProps) {
  const router = useRouter();

  // 表示内容（仮のメッセージ）
  const chatContent = (
    <div className="p-4 space-y-2">
      <p className="text-lg font-semibold">チャットスペース - {userId}</p>
      <p>メッセージ1: こんにちは！</p>
      <p>メッセージ2: お疲れ様です。</p>
    </div>
  );

  return (
    <div className="h-full w-full">
      {/* 小さい画面幅の戻るボタン */}
      <div className="flex sm:hidden p-2 border-b bg-gray-50 flex items-center">
        <button onClick={() => router.push("/expchat")} className="flex items-center space-x-1 text-blue-500">
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </button>
      </div>

      {/* チャット内容 */}
      <div className="overflow-auto">{chatContent}</div>
    </div>
  );
}
