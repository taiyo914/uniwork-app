import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

interface Profile {
  user_id: string;
  english_name: string;
  japanese_name: string;
  image_url: string;
}

interface ChatSpace {
  id: string;
  name: string;
  imageUrl?: string;
  isGroup?: boolean;
}

async function fetchProfiles(): Promise<Profile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, english_name, japanese_name, image_url');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data || [];
}

export default async function VerticalChatNav() {
  const profiles = await fetchProfiles();

  const chatSpaces: ChatSpace[] = [
    {
      id: 'group',
      name: 'グループチャット',
      isGroup: true,
    },
    ...profiles.map((profile) => ({
      id: profile.user_id,
      name: profile.japanese_name || profile.english_name,
      imageUrl: profile.image_url,
      isGroup: false,
    })),
  ];

  return (
    <nav className="h-full w-full border-r-[2px] bg-gray-50 xs:fixed xs:top-0 xs:left-0 xs:h-full">
      <ul className="p-4 space-y-2">
        {chatSpaces.map((space) => (
          <li key={space.id}>
            <Link
              href={`/employee/ja-JP/chat/${space.isGroup ? 'group' : space.id}`}
              className="block px-4 py-2 rounded-md hover:bg-gray-200"
            >
              {space.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
