'use client'

import { useState } from 'react'
import { Bell, Clock, Check } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'

type Notification = {
  id: number
  title: string
  content: string
  created_at: Date
  type: 'warning' | 'info' | 'success' | 'alert'
}


// 通知データを配列として直接定義
const notificationsData = [
  {
    id: 1,
    title: "休憩時間超過注意",
    content: "本日の休憩時間が1時間を超えています",
    created_at: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2時間前
    type: "warning" as const,
  },
  {
    id: 2,
    title: "勤務時間報告",
    content: "先週の勤務時間が確定しました",
    created_at: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1日前
    type: "info" as const,
  },
  {
    id: 3,
    title: "承認完了のお知らせ",
    content: "3月分の勤務時間が承認されました",
    created_at: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3日前
    type: "success" as const,
  },
  {
    id: 4,
    title: "システムメンテナンス予定",
    content: "明日午前2時からメンテナンスを実施します",
    created_at: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5日前
    type: "info" as const,
  },
  {
    id: 5,
    title: "給与振込完了",
    content: "今月分の給与が振り込まれました",
    created_at: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7日前
    type: "success" as const,
  },
  {
    id: 6,
    title: "古い通知",
    content: "これは古い通知です。",
    created_at: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 40日前
    type: "info" as const,
  },
  {
    id: 7,
    title: "古い通知",
    content: "これは古い通知です。",
    created_at: new Date(new Date().getTime() - 40 * 24 * 60 * 60 * 1000), // 40日前
    type: "info" as const,
  },
];

// 相対時間を計算する関数
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 30) {
    return `${diffInDays}日前`;
  } else {
    return format(date, 'yyyy/MM/dd'); // 日付フォーマット
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData)

  const [checkedNotifications, setCheckedNotifications] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    setCheckedNotifications(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const getBackgroundColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked) return 'bg-gray-50'
    switch (type) {
      case 'warning': return 'bg-red-50'
      case 'info': return 'bg-white'
      case 'success': return 'bg-green-50/50'
      case 'alert': return 'bg-yellow-50/50'
      default: return 'bg-white'
    }
  }

  const getTitleTextColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked) return 'text-gray-400/70'
    switch (type) {
      case 'warning': return 'text-red-500'
      case 'info': return 'text-gray-600'
      case 'success': return 'text-green-600'
      case 'alert': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getContentTextColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked) return 'text-gray-400/70'
    switch (type) {
      case 'warning': return 'text-red-600'
      // case 'info': return 'text-gray-600'
      // case 'success': return 'text-gray-600'
      // case 'alert': return 'text-gray-600'
      default: return 'text-foreground'
    }
  }

  const getBorderColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked) return 'border-gray-100'
    switch (type) {
      case 'warning': return 'border-red-200';
      // case 'info': return 'border-gray-300';
      // case 'success': return 'border-green-400';
      case 'alert': return 'border-yellow-400';
      default: return 'border-gray-300/90';
    }
  }

  return (
    <div>
      <section className="w-full shadow rounded-xl overflow-hidden">
          <Card className="">
            <CardHeader className="gap-1 bg-blue-100 py-4 px-3 md:px-4">
              <h2 className="text-lg font-bold text-blue-800">
                <Bell className="h-5 w-5 text-blue-600 inline mb-1 mr-1" />通知・お知らせ
              </h2>
            </CardHeader>
            <CardContent className=" bg-gray-50/40 px-0 py-0">
              <ScrollArea className="h-[300px] w-full py-0 px-0 ">
                <div className="space-y-2 sm:space-y-2.5 pt-2 sm:pt-3 px-3 sm:px-4">
                  {notifications.map(notification => {
                  const isChecked = checkedNotifications.includes(notification.id.toString())
                  return (
                    <div 
                      key={notification.id}
                      className={` pb-2 pt-3 px-3 rounded-lg relative transition-colors duration-300 ${getBackgroundColor(notification.type, isChecked)} border ${getBorderColor(notification.type, isChecked)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center" role="checkbox" aria-checked={isChecked} aria-label={`${notification.title}を既読としてマーク`}>
                          <div 
                            onClick={() => handleCheckboxChange(notification.id.toString())}
                            className={`w-4 h-4 rounded-full mr-1  flex items-center justify-center cursor-pointer ${
                              isChecked ? 'bg-green-500' : 'border-[1px] bg-white border-gray-300'
                            }`}
                          >
                            <Check 
                              className={`h-3 w-3 ${isChecked ? 'text-white' : 'text-gray-300'}`} 
                              aria-hidden="true"
                            />
                          </div>
                          <h3 className={`text-sm sm:text-md font-semibold ${getTitleTextColor(notification.type, isChecked)}`}>
                            {notification.title}
                          </h3>
                        </div>
                        <span className={`text-xs sm:text-sm ${isChecked ? 'text-gray-400/70' : 'text-gray-500'}`}>{getRelativeTime(notification.created_at)}</span>
                      </div>
                      <p className={`text-xs sm:text-sm mb-1 ${getContentTextColor(notification.type, isChecked)} ml-2`}>
                        {notification.content}
                      </p>
                    </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
    
    </div>
  )
}