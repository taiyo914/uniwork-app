"use client";
import React from "react";
import { useParams } from "next/navigation";
import DirectChat from "../DirectChat";
import GroupChat from "../GroupChat";

export default function ChatUserPage() {
  const { userId } = useParams(); // userIdを取得

  if (userId === "group"){
    return (
      <GroupChat/>
    )
  }

  return (
    <DirectChat/>
  );
}
