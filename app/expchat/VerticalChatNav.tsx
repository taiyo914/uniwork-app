"use client";
import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

interface ChatSpace {
  id: string;
  name: string;
}

const chatSpaces: ChatSpace[] = [
  { id: "group", name: "グループチャット" },
  { id: "user1", name: "ユーザー1" },
  { id: "user2", name: "ユーザー2" },
  { id: "user3", name: "ユーザー3" },
];

export default function VerticalChatNav() {
  const { userId } = useParams();
  const pathname = usePathname();

  return (
    <nav className="h-full w-full border-r-[2px] bg-gray-50 xs:fixed xs:top-0 xs:left-0 xs:h-full">
      <ul className="p-4 space-y-2">
        {chatSpaces.map((space) => (
          <li key={space.id}>
            <Link
              href={`/expchat/${space.id}`}
              className={`block px-4 py-2 rounded-md ${
                userId === space.id || pathname === `/expchat/${space.id}`
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {space.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
