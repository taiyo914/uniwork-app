// chat/layout.tsx
"use client";
import React from "react";
import VerticalChatNav from "./VerticalChatNav";
import { usePathname } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRootChatPage = pathname === `/admin/chat` // ルートページかどうかを判定
  return (
    <div className="flex h-screen w-full">
      <div className={`sm:max-w-52 md:max-w-64 lg:max-w-72 w-full
        ${isRootChatPage 
          ? "block "
          : "hidden sm:block"}
      `}>
        <VerticalChatNav />
      </div>
      <div className={`flex-grow h-full
        ${isRootChatPage 
          ? "sm:block hidden"
          : ""}
      `}>
        {children}
      </div>
    </div>
  );
}
