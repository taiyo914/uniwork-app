'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeHeader } from './components/EmployeeHeader'
import { Notifications } from './components/Notifications'
import { StatisticsTab } from './components/StatisticsTab'
import { TimestampsTab } from './components/TimesStampsTab'
import { EmployeeInfoTab } from './components/EmployeeInfoTab'
import { ChatWindow } from './components/ChatWindow'
import { Employee, EmployeeStatistics, Notification, TimeStamp } from '@/types/employee'

export default function EmployeeDashboardSample() {
  const [showChat, setShowChat] = useState(false)

  const employee: Employee = {
    name: "田中 太郎",
    id: "EMP001",
    avatar: "/placeholder.svg?height=100&width=100",
    department: "営業部",
    position: "主任",
    email: "tanaka.taro@example.com",
    phone: "090-1234-5678",
    joinDate: "2020年4月1日",
    nationality: "日本",
    visaStatus: "該当なし",
    languages: ["日本語", "英語"],
    emergencyContact: "田中 花子 (妻) - 080-9876-5432"
  }

  const employeeStats: EmployeeStatistics = {
    weeklyHours: { approved: 35, unapproved: 3 },
    monthlyHours: { approved: 140, unapproved: 12 },
    hourlyRate: 1500,
    monthlySalary: { approved: 210000, unapproved: 18000 },
    recentWeekHours: 22
  }

  const timeStamps: TimeStamp[] = [
    {
      date: "2023-05-15",
      checkIn: "09:00",
      checkOut: "18:00",
      breakTimes: [
        { start: "12:00", end: "13:00", memo: "昼食休憩" },
        { start: "15:00", end: "15:15", memo: "コーヒーブレイク" }
      ],
      memo: "プロジェクトAのミーティング",
      approved: false
    },
    {
      date: "2023-05-16",
      checkIn: "08:55",
      checkOut: "18:30",
      breakTimes: [
        { start: "12:30", end: "13:30", memo: "昼食休憩" }
      ],
      memo: "クライアントBとの打ち合わせ",
      approved: false
    },
    {
      date: "2023-05-17",
      checkIn: "09:05",
      checkOut: "18:15",
      breakTimes: [
        { start: "12:00", end: "12:45", memo: "昼食休憩" },
        { start: "15:30", end: "15:45", memo: "短時間休憩" }
      ],
      memo: "新人研修",
      approved: false
    },
    {
      date: "2023-05-18",
      checkIn: "08:50",
      checkOut: "18:20",
      breakTimes: [
        { start: "12:15", end: "13:15", memo: "昼食休憩" }
      ],
      memo: "資料作成",
      approved: false
    },
    {
      date: "2023-05-19",
      checkIn: "09:10",
      checkOut: "18:00",
      breakTimes: [
        { start: "12:00", end: "13:00", memo: "昼食休憩" },
        { start: "15:00", end: "15:30", memo: "部署ミーティング" }
      ],
      memo: "週次レビュー",
      approved: false
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-0">

      <div className="lg:hidden">
        <div className="h-5"></div>
        <EmployeeHeader employee={employee} onChatOpen={() => setShowChat(true)} />
        <div className="h-4"></div>
      </div>    
 
      <div className="lg:flex">

        <div className="
          border border-gray-200 rounded-lg 
          lg:border-none lg:rounded-none
           lg:border-gray-300 lg:h-screen lg:max-w-[400px] lg:w-1/3 
        ">
          <Notifications />
        </div>

        <div className="lg:h-screen lg:border-[0.7px] lg:my-0 my-5 "/>

        <div className="lg:flex-1 lg:px-7 lg:py-5 lg:w-full"> 
          <div className="lg:block hidden">
            <EmployeeHeader employee={employee} onChatOpen={() => setShowChat(true)} />
            <div className="mt-4"></div>
          </div>
          <Tabs defaultValue="statistics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="statistics">統計</TabsTrigger>
              <TabsTrigger value="timestamps">タイムスタンプ</TabsTrigger>
              <TabsTrigger value="employee-info">従業員情報</TabsTrigger>
            </TabsList>
            <TabsContent value="statistics">
              <StatisticsTab employeeStats={employeeStats} />
            </TabsContent>
            <TabsContent value="timestamps">
              <TimestampsTab timeStamps={timeStamps} />
            </TabsContent>
            <TabsContent value="employee-info">
              <EmployeeInfoTab employee={employee} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className='h-10 lg:hidden'></div>

      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}
        
    </div>
  )
}