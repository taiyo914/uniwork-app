'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeHeader } from './components/EmployeeHeader'
import { Notifications } from './components/Notifications'
import { StatisticsTab } from './components/StatisticsTab'
import { TimestampsTab } from './components/TimesStampsTab'
import { EmployeeInfoTab } from './components/EmployeeInfoTab'
import { ChatWindow } from './components/ChatWindow'
import { Profile, Stats, AttendanceLog } from './employee'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from "@/utils/supabase/client"
import { useParams } from "next/navigation"
import { calculateDateRanges } from "@/utils/calculateDateRanges";

export default function EmployeeDashboard() {
  const [showChat, setShowChat] = useState(false)
  const [employee, setEmployee] = useState<Profile | null>(null)
  const [employeeStats, setEmployeeStats] = useState<Stats | null>(null)
  const [timeStamps, setTimeStamps] = useState<AttendanceLog[]>([])
  const { userId } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      // プロフィール情報の取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, image_url, english_name, japanese_name, emp_id, email, nationality, residence_status, expiration_date, hourly_wage, currency, work_status, employment_type')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        console.error('Failed to fetch profile:', profileError)
        return
      }

      setEmployee(profileData as Profile)

      // 日付範囲の計算
      const dateRanges = calculateDateRanges();

      // 勤怠記録の取得
      const { data: attendanceLogs, error: attendanceError } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          work_start,
          work_end,
          memo,
          approved,
          break_logs (
            break_start,
            break_end,
            memo
          )
        `)
        .eq('user_id', userId)
        .gte('work_start', new Date(Math.min(
          dateRanges.lastSevenDays.start.getTime(),
          dateRanges.thisWeek.start.getTime(),
          dateRanges.thisMonth.start.getTime()
        )).toISOString())
        .order('work_start', { ascending: false });

      if (attendanceError) {
        console.error('Failed to fetch attendance logs:', attendanceError)
        return
      }

      let weeklyStats = { total: 0, approved: 0, unapproved: 0 }
      let lastSevenDaysStats = { total: 0, approved: 0, unapproved: 0 }
      let monthlyStats = { total: 0, approved: 0, unapproved: 0 }

      attendanceLogs?.forEach(record => {
        if (!record.work_start || !record.work_end) return

        const workStart = new Date(record.work_start)
        const workEnd = new Date(record.work_end)

        // 勤務時間を分単位で計算
        const workMinutes = Math.round((workEnd.getTime() - workStart.getTime()) / (1000 * 60))
        let breakMinutes = 0
        record.break_logs?.forEach(breakLog => {
          if (breakLog.break_start && breakLog.break_end) {
            const breakStart = new Date(breakLog.break_start)
            const breakEnd = new Date(breakLog.break_end)
            breakMinutes += Math.round((breakEnd.getTime() - breakStart.getTime()) / (1000 * 60))
          }
        })

        const netWorkMinutes = workMinutes - breakMinutes

        // 直近7日間の計算
        if (workStart >= dateRanges.lastSevenDays.start && workStart <= dateRanges.lastSevenDays.end) {
          lastSevenDaysStats.total += netWorkMinutes
          if (record.approved) {
            lastSevenDaysStats.approved += netWorkMinutes
          } else {
            lastSevenDaysStats.unapproved += netWorkMinutes
          }
        }

        // 今週の計算
        if (workStart >= dateRanges.thisWeek.start && workStart <= dateRanges.thisWeek.end) {
          weeklyStats.total += netWorkMinutes
          if (record.approved) {
            weeklyStats.approved += netWorkMinutes
          } else {
            weeklyStats.unapproved += netWorkMinutes
          }
        }

        // 今月の計算
        if (workStart >= dateRanges.thisMonth.start && workStart <= dateRanges.thisMonth.end) {
          monthlyStats.total += netWorkMinutes
          if (record.approved) {
            monthlyStats.approved += netWorkMinutes
          } else {
            monthlyStats.unapproved += netWorkMinutes
          }
        }
      })

      // 給与計算（時給を分給に変換して計算）
      const hourlyWage = profileData?.hourly_wage || 0
      const minuteRate = hourlyWage / 60

      // 収入の計算
      const incomeStats = {
        total: Math.floor(monthlyStats.total * minuteRate),
        approved: Math.floor(monthlyStats.approved * minuteRate),
        unapproved: Math.floor(monthlyStats.unapproved * minuteRate),
        hourlyWage: hourlyWage,
        currency: profileData?.currency || 'JPY',
      }

      setEmployeeStats({
        weekly: weeklyStats,
        lastSevenDays: lastSevenDaysStats,
        monthly: monthlyStats,
        income: incomeStats,
      })

      setTimeStamps(attendanceLogs as AttendanceLog[])
    }

    fetchData()
  }, [userId])

  if (!employee || !employeeStats) {
    return <div>Loading...</div>
  }

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
                <TabsTrigger value="timestamps">打刻履歴</TabsTrigger>
                <TabsTrigger value="employee-info">従業員情報</TabsTrigger>
              </TabsList>
              <TabsContent value="statistics">
                <StatisticsTab stats={employeeStats} profile={employee}/>
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