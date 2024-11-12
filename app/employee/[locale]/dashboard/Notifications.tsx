'use client'

import { useState, useMemo } from 'react'
import { Bell, Clock, Check, Trash2, RotateCcw } from "lucide-react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Notification = {
  id: number
  title: string
  content: string
  details: string
  created_at: Date
  type: 'warning' | 'info' | 'success' | 'alert'
  is_read: boolean
}


// 通知データを配列として直接定義
const notificationsData = [
  {
    id: 1,
    title: "休憩時間超過注意",
    content: "本日の休憩時間が1時間を超えています",
    details: "本日の休憩時間が規定の1時間を30分超過しています。労働基準法に基づき、適切な休憩時間の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2時間前
    deleted_at: null,
    type: "warning" as const,
    is_read: false
  },
  {
    id: 2,
    title: "勤務時間報告",
    content: "先週の勤務時間が確定しました",
    details: "先週の勤務時間が確定しました。労働基準法に基づき、適切な勤務時間の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1日前
    deleted_at: null,
    type: "info" as const,
    is_read: false
  },
  {
    id: 3,
    title: "承認完了のお知らせ",
    content: "3月分の勤務時間が承認されました",
    details: "3月分の勤務時間が承認されました。労働基準法に基づき、適切な給与の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3日前
    deleted_at: null,
    type: "success" as const,
    is_read: false
  },
  {
    id: 4,
    title: "システムメンテナンス予定",
    content: "明日午前2時からメンテナンスを実施します",
    details: "日午前2時からメンテナンスを実施します。システムのメンテナンスにより、システムの機能が一時的に停止する場合があります。",
    created_at: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5日前
    deleted_at: null,
    type: "info" as const,
    is_read: false
  },
  {
    id: 5,
    title: "給与振込完了",
    content: "今月分の給与が振り込まれました",
    details: "今月分の給与が振り込まれました。労働基準法に基づき、適切な給与の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7日前
    deleted_at: null,
    type: "success" as const,
    is_read: false
  },
  {
    id: 6,
    title: "古い通知",
    content: "これは古い通知です。",
    details: "これは古い通知です。労働基準法に基づき、適切な通知の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 40日前
    deleted_at: null,
    type: "info" as const,
    is_read: false
  },
  {
    id: 7,
    title: "古い通知",
    content: "これは古い通知です。",
    details: "これは古い通知です。労働基準法に基づき、適切な通知の管理をお願いします。",
    created_at: new Date(new Date().getTime() - 40 * 24 * 60 * 60 * 1000), // 40日前
    deleted_at: null,
    type: "info" as const,
    is_read: false
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
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false)

  // フィルタリング処理を更新
  const filteredNotifications = useMemo(() => {
    switch (readFilter) {
      case 'unread':
        return notifications.filter(n => !n.is_read)
      case 'read':
        return notifications.filter(n => n.is_read)
      default:
        return notifications
    }
  }, [notifications, readFilter])

  // 既読状態の更新
  const handleReadStatusChange = (id: number) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id
        ? { ...notification, is_read: !notification.is_read }
        : notification
    ))
    setIsModalOpen(false)
  }

  // モーダルを開く
  const openModal = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }

  const [checkedNotifications, setCheckedNotifications] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    setCheckedNotifications(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const getBackgroundColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked && readFilter === 'all') return 'bg-gray-50'
    switch (type) {
      case 'warning': return 'bg-red-50'
      case 'info': return 'bg-white'
      case 'success': return 'bg-green-50/50'
      case 'alert': return 'bg-yellow-50/50'
      default: return 'bg-white'
    }
  }

  const getTitleTextColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked && readFilter === 'all') return 'text-gray-400'
    switch (type) {
      case 'warning': return 'text-red-500'
      case 'info': return 'text-gray-600'
      case 'success': return 'text-green-600'
      case 'alert': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getContentTextColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked && readFilter === 'all') return 'text-gray-400/80'
    switch (type) {
      case 'warning': return 'text-red-600'
      // case 'info': return 'text-gray-600'
      // case 'success': return 'text-gray-600'
      // case 'alert': return 'text-gray-600'
      default: return 'text-foreground'
    }
  }

  const getBorderColor = (type: Notification['type'], isChecked: boolean) => {
    if (isChecked && readFilter === 'all') return 'border-gray-200'
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
        <Card>
          <CardHeader className="gap-1 bg-blue-100 xs:py-2 py-3 pl-4 md:pl-5 pr-0 md:pr-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-800">
                <Bell className="h-5 w-5 text-blue-600 inline mb-1 mr-1" />通知・お知らせ
              </h2>
              <Select
                value={readFilter}
                onValueChange={(value: 'all' | 'unread' | 'read') => setReadFilter(value)}
              >
                <SelectTrigger className="w-fit gap-1 focus:ring-0 focus:ring-offset-0 bg-blue-100 border-none">
                  <SelectValue placeholder="表示する通知" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all">すべて表示</SelectItem>
                  <SelectItem value="unread">未読のみ</SelectItem>
                  <SelectItem value="read">既読のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="bg-gray-50/40 px-0 py-0">
            <ScrollArea className="h-[300px] w-full py-0 px-0">
              <div className="space-y-2 sm:space-y-2.5 pt-2 sm:pt-3 px-3 sm:px-4 pb-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-5 text-gray-500">
                    表示するメッセージはありません
                  </div>
                ) : (
                  filteredNotifications.map(notification => {
                    return (
                      <div 
                        key={notification.id}
                        className={`hover:cursor-pointer hover:scale-[1.005] hover:shadow-sm pb-2 pt-3 px-3 rounded-lg relative transition-all duration-300 ${getBackgroundColor(notification.type, notification.is_read)} border ${getBorderColor(notification.type, notification.is_read)}`}
                        onClick={() => openModal(notification)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center" role="checkbox" aria-checked={notification.is_read} aria-label={`${notification.title}を既読としてマーク`}>
                            <div 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReadStatusChange(notification.id)
                            }}
                              className={`w-5 h-5 rounded-full mr-1.5 flex items-center justify-center cursor-pointer ${
                                notification.is_read ? 'bg-green-400' : 'border-[1px] bg-white border-gray-300 hover:bg-green-100 transition-colors '
                              }`}
                            >
                              <Check 
                                className={`h-4 w-4 ${notification.is_read ? 'text-white' : 'text-gray-300'}`} 
                                aria-hidden="true"
                              />
                            </div>
                            <h3 className={`text-sm sm:text-md font-semibold ${getTitleTextColor(notification.type, notification.is_read)}`}>
                              {notification.title}
                            </h3>
                          </div>
                          <span className={`text-xs sm:text-sm ${notification.is_read ? 'text-gray-400/70' : 'text-gray-500'}`}>{getRelativeTime(notification.created_at)}</span>
                        </div>
                        <p className={`text-xs sm:text-sm mb-1 ${getContentTextColor(notification.type, notification.is_read)} ml-2`}>
                          {notification.content}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>

      {/* Dialogを使用したモーダル */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotification.title}</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-gray-600 mb-2">
                {format(selectedNotification.created_at, 'yyyy年MM月dd日 HH:mm')}
              </div>
              <div className="text-gray-800 mb-4">{selectedNotification.content}</div>
              <div className="text-gray-700 text-sm">{selectedNotification.details}</div>
              
              <DialogFooter className="flex gap-2 mt-6">
                <Button
                  variant={selectedNotification.is_read ? "outline" : "secondary"}
                  onClick={() => handleReadStatusChange(selectedNotification.id)}
                >
                  {selectedNotification.is_read ? (
                    <RotateCcw className="h-4 w-4 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {selectedNotification.is_read ? '未読にする' : '既読にする'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}