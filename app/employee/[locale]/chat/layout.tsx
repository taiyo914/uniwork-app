import React from 'react'
import ChatSidebar from './ChatSidebar'

export default function layout({children}:{children: React.ReactNode;}) {
  return (
    <div className="flex overflow-hidden h-screen ">
      <ChatSidebar />
      <div className="flex-1 overflow-auto ">
        {children}
      </div>
    </div>
  )
}
