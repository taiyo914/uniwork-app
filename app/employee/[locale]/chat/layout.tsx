"use client"
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const {locale} =  useParams()
  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <div className="w-64 bg-gray-100 border-r border-gray-300 p-4">
        <h2 className="font-bold mb-4">チャット</h2>
        <nav className="space-y-2">
          {/* グループチャット */}
          <Link href={`/employee/${locale}/chat`}className="block p-2 rounded hover:bg-gray-200">
            全体チャット
          </Link>
          {/* ユーザーごとの個別チャット */}
          <Link href={`/employee/${locale}/chat/user1`} className="block p-2 rounded hover:bg-gray-200">
            田中太郎
          </Link>
          <Link href={`/employee/${locale}/chat/user2`} className="block p-2 rounded hover:bg-gray-200">
            山田花子
          </Link>
          <Link href={`/employee/${locale}/chat/user3`} className="block p-2 rounded hover:bg-gray-200">
            佐藤次郎
          </Link>
        </nav>
      </div>

      {/* チャット内容表示エリア */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
