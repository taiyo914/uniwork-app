'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeHeader } from './components/EmployeeHeader'
import { Notifications } from './components/Notifications'
import { StatisticsTab } from './components/StatisticsTab'
import { TimestampsTab } from './components/TimesStampsTab'
import { EmployeeInfoTab } from './components/EmployeeInfoTab'
import { ChatWindow } from './components/ChatWindow'
import { Employee, EmployeeStatistics, Notification, TimeStamp } from './employee'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function EmployeeDashboard() {
  const [showChat, setShowChat] = useState(false)

  const employee: Employee = {
    user_id: "EMP001",
    image_url: "/placeholder.svg?height=100&width=100",
    english_name: "Tanaka Taro",
    japanese_name: "田中 太郎",
    emp_id: "EMP001",
    email: "tanaka.taro@example.com",
    nationality: "Japan",
    residence_status: "該当なし",
    expiration_date: "2024年12月31日"
  }

  const employeeStats: EmployeeStatistics = {
    weeklyHours: { approved: 35, unapproved: 3 },
    monthlyHours: { approved: 140, unapproved: 12 },
    weeklyWage: { approved: 100000, unapproved: 10000 },
    monthlyWage: { approved: 210000, unapproved: 18000 },
    hourlyRate: 1500,
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
      memo: "",
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
      memo: "",
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
           lg:border-gray-300 lg:h-screen lg:max-w-[400px] lg:w-1/3  lg:min-w-[300px]
        ">
          <Notifications />
        </div>

        <div className="lg:h-screen lg:border-[0.7px] lg:my-0 my-5 "/>

        <div className="lg:flex-1  lg:w-full lg:h-screen "> 
          <ScrollArea className='h-full lg:px-7 '>
            <div className="lg:block hidden mt-4">
              <EmployeeHeader employee={employee} onChatOpen={() => setShowChat(true)} />
              <div className="mt-4"></div>
            </div>
            <Tabs defaultValue="statistics" className="space-y-5">
              <TabsList>
                <TabsTrigger value="statistics">統計情報</TabsTrigger>
                <TabsTrigger value="timestamps">タイムスタンプ</TabsTrigger>
                <TabsTrigger value="employee-info">従業員情報</TabsTrigger>
              </TabsList>
              <TabsContent value="statistics">
                <StatisticsTab stats={employeeStats} />
              </TabsContent>
              <TabsContent value="timestamps">
                <TimestampsTab timeStamps={timeStamps} />
              </TabsContent>
              <TabsContent value="employee-info">
                <EmployeeInfoTab employee={employee} />
              </TabsContent>
            </Tabs>
            
            <div className='h-10 '></div>
          </ScrollArea>
        </div>

      </div>


      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}
        
    </div>
  )
}