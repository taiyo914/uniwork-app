'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { MessageCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/stores/useChatStore'


const users = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
  { id: 'user3', name: 'Charlie' },
  { id: 'user4', name: 'David' },
  { id: 'user5', name: 'Eve' },
]

export default function ChatSidebar() {
  const { isSidebarExpanded, toggleSidebar } = useChatStore()
  const pathname = usePathname()
  const { locale } = useParams()
  const { t } = useTranslation()

  return (
    <div className={`
      fixed top-0 left-0 h-full xs:ml-0 ml-16 sm:ml-0 w-64 xs:w-full xs:mt-[3.5rem]
      border-r border-gray-200 bg-white
      transition-all duration-300 ease-in-out
      ${isSidebarExpanded ? 'w-64' : 'w-0 -translate-x-full sm:w-64 sm:translate-x-0'}
      z-10 sm:relative sm:translate-x-0 
    `}>
      <div className="flex items-center justify-between py-2 px-3 border-gray-200">
        <h3 className={`font-semibold text-gray-700 ${isSidebarExpanded ? '' : 'hidden sm:block'}`}>チャット一覧</h3>
        <button
          onClick={toggleSidebar}
          className={`p-1 rounded-full hover:bg-gray-100 block sm:hidden ${isSidebarExpanded ? '' : 'hidden sm:block'}`}
          // aria-label={isSidebarExpanded ? t('collapse_sidebar') : t('expand_sidebar')}
        >
           <ChevronLeft size={20} /> 
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className={`text-sm font-medium text-gray-500 mb-2 ${isSidebarExpanded ? '' : 'hidden sm:block'}`}>
            全体チャット
          </h3>
          <div className="space-y-1">
            <Link
              href={`/employee/${locale}/chat`}
              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                pathname === `/employee/${locale}/chat` ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Users size={20} className="flex-shrink-0" />
                <span className="ml-3">全体チャット</span>
            </Link>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200">
          <h3 className={`text-sm font-medium text-gray-500 mb-2 ${isSidebarExpanded ? '' : 'hidden sm:block'}`}>
            個人チャット
          </h3>
          <ul className="space-y-1">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/employee/${locale}/chat/${user.id}`}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                    pathname === `/employee/${locale}/chat/${user.id}` ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <MessageCircle size={20} className="flex-shrink-0" />
                   <span className="ml-3">{user.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}