// chat/layout.tsx
"use client";
import React from "react";
import VerticalChatNav from "./VerticalChatNav";
import { useParams, usePathname } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { locale} = useParams();
  const pathname = usePathname();
  const isRootChatPage = pathname === `/employee/${locale}/chat` // ルートページかどうかを判定
  return (
    <div className="flex h-screen">
      <div className={`sm:max-w-52 md:max-w-64 w-full
        ${isRootChatPage 
          ? "block "
          : "hidden sm:block"}
      `}>
        <VerticalChatNav />
      </div>
      <div className={`w-full
        ${isRootChatPage 
          ? "sm:block hidden"
          : ""}
      `}>
        {children}
      </div>
    </div>
  );
}
