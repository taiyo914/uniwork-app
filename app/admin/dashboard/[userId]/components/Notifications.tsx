'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Notification {
  id: number
  created_at: string
  title: string
  content: string
  type: 'success' | 'alert' | 'info' | 'warning'
  is_read: boolean
  deleted_at: string | null
}

// 相対時間を計算する関数
const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
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
    return format(date, 'yyyy/MM/dd');
  }
};

// サンプルデータを定数として定義
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    created_at: "2024-11-13T10:00:00Z",
    title: "労働時間超過警告",
    content: "田中さんの今週の労働時間が40時間を超えています。確認してください。",
    type: "alert",
    is_read: false,
    deleted_at: null
  },
  {
    id: 2,
    created_at: "2024-11-08T15:30:00Z",
    title: "タイムスタンプ未承認", 
    content: "5月17日のタイムスタンプが未承認です。",
    type: "warning",
    is_read: false,
    deleted_at: null
  },
  {
    id: 3,
    created_at: "2024-11-02T09:15:00Z",
    title: "シフト希望提出",
    content: "田中さんが新しいシフト希望を提出しました。",
    type: "info",
    is_read: false,
    deleted_at: null
  },
  {
    id: 4,
    created_at: "2024-10-27T14:20:00Z",
    title: "有給休暇申請承認",
    content: "佐藤さんの有給休暇申請が承認されました。",
    type: "success",
    is_read: false,
    deleted_at: null
  },
  {
    id: 5,
    created_at: "2024-10-21T11:45:00Z",
    title: "残業申請",
    content: "鈴木さんから残業申請が提出されました。",
    type: "info",
    is_read: false,
    deleted_at: null
  },

];

export function Notifications() {
  const [readNotifications, setReadNotifications] = useState<Notification[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
  const [showReadNotifications, setShowReadNotifications] = useState(false)

  const completeNotification = (id: number) => {
    setUnreadNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    )

    setTimeout(() => {
      setUnreadNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      )
      setReadNotifications(prevNotifications => {
        const updatedNotifications = [
          ...prevNotifications,
          ...unreadNotifications
            .filter(notification => notification.id === id)
            .map(notification => ({ ...notification, is_read: true }))
        ];
        return updatedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      });
    }, 300)
  }

  const uncompleteNotification = (id: number) => {
    setReadNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, is_read: false } : notification
      )
    )

    setTimeout(() => {
      setReadNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      )
      setUnreadNotifications(prevNotifications => {
        const updatedNotifications = [
          ...prevNotifications,
          ...readNotifications
            .filter(notification => notification.id === id)
            .map(notification => ({ ...notification, is_read: false }))
        ];
        return updatedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      });
    }, 300)
  }

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      // case 'success':
      //   return <CheckCircle className="w-4 h-4 text-green-500 mb-0.5" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500  mb-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500  mb-0.5" />;
      // case 'info':
      //   return <Info className="w-4 h-4 text-blue-500 mb-0.5" />;
      default:
        return null;
    }
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-3 pt-5 px-5">
        <h3 className="text-lg font-semibold ml-1">通知</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {showReadNotifications ? '既読の通知' : '未読の通知'}
          </span>
          <Switch
            checked={showReadNotifications}
            onCheckedChange={setShowReadNotifications}
          />
        </div>
      </div>
      <ScrollArea className="h-[300px] lg:h-[calc(100vh-60px)] px-3 sm:px-4">
        { !showReadNotifications ? (
          <AnimatePresence>
          {unreadNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={!showReadNotifications ? { opacity: 1, height: 'auto' } : undefined}
              exit={!showReadNotifications ? { opacity: 0, height: 0 } : undefined}
              transition={!showReadNotifications ? { duration: 0.3, ease: "easeInOut" } : {duration: 0}}
              className={`${notification.is_read ? 'opacity-50' : 'opacity-100'}`}
            >
              <motion.div
                layout
                className={`border p-3 rounded mb-2 ${notification.type === 'alert' ? 'bg-red-50 border-red-100/90' : ''}`}
              >
                <div className={`flex items-start space-x-2 rounded-none transition-all`}>
                  <div className="">
                    <Checkbox
                      checked={notification.is_read}
                      onCheckedChange={() => completeNotification(notification.id)}
                      className="min-h-4 min-w-4 border border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`flex items-center gap-1 font-medium ${notification.is_read ? 'line-through text-gray-400' : ""}`}>
                        {getTypeIcon(notification.type)}
                        {notification.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getRelativeTime(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notification.is_read ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                      {notification.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            {readNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={showReadNotifications ? { opacity: 1, height: 'auto' } : undefined}
                exit={showReadNotifications ? { opacity: 0, height: 0 } : undefined}
                transition={showReadNotifications ? { duration: 0.3, ease: "easeInOut" } : {duration: 0}}
                className={`${notification.is_read ? 'opacity-50' : 'opacity-100'}`}
              >
                <motion.div
                  layout
                  className={`border p-3 rounded mb-2`}
                >
                  <div className="flex items-start space-x-2 rounded-none transition-all">
                    <div className="">
                      <Checkbox
                        checked={notification.is_read}
                        onCheckedChange={() => uncompleteNotification(notification.id)}
                        className="min-h-4 min-w-4 border border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`flex items-center gap-1 font-medium`}>
                          {getTypeIcon(notification.type)}
                          {notification.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed `}>
                        {notification.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </ScrollArea>
    </div>
  )
}