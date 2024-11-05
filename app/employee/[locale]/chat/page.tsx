"use client";
import React from "react";
import { useParams } from "next/navigation";
import VerticalChatNav from "./VerticalChatNav";
import DirectChat from "./DirectChat"; // チャットスペースの表示エリアコンポーネントを作成する

export default function ChatPage() {
  const { userId } = useParams(); // ユーザーIDを取得

  return (
    // <div className="flex h-screen ">
    //   <div className="sm:max-w-52 md:max-w-64 w-full ">
    //     <VerticalChatNav />
    //   </div>

    //   <div className="w-full flex justify-center items-center hidden sm:block">
    //     {userId ? <DirectChat userId={userId[0]} /> : <p>チャットスペースを選択してください。</p>}
    //   </div>
    // </div>
    <div>
      <div className="w-full block sm:hidden">
        <VerticalChatNav />
       </div>
      <div className="sm:block hidden">チャットを選んでください</div>
    </div>
  );
}
