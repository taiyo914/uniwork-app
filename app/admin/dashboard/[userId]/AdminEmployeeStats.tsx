'use client'

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, subDays } from "date-fns"
import { supabase } from "@/utils/supabase/client"
import { Clock, DollarSign, Calendar, CalendarDays, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { calculateDateRanges } from "@/utils/calculateDateRanges"
import { ja } from 'date-fns/locale'

type Props = {
  profile: any
  userId: string
}

const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours === 0) {
    return `${minutes}分`
  }
  if (minutes === 0) {
    return `${hours}時間`
  }
  return `${hours}時間${minutes}分`
}

export default function AdminEmployeeStats({ profile, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    weekly: { total: 0, approved: 0, unapproved: 0 },
    lastSevenDays: { total: 0, approved: 0, unapproved: 0 },
    monthly: { total: 0, approved: 0, unapproved: 0 },
    income: { total: 0, approved: 0, unapproved: 0, hourlyWage: 0, currency: 'JPY' },
  })

  useEffect(() => {
    const loadData = async () => {
      const dateRanges = calculateDateRanges()
      
      const earliestDate = new Date(Math.min(
        dateRanges.lastSevenDays.start.getTime(),
        dateRanges.thisWeek.start.getTime(),
        dateRanges.thisMonth.start.getTime()
      ))

      const { data: attendanceLogs, error } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          work_start,
          work_end,
          approved,
          break_logs (
            break_start,
            break_end
          )
        `)
        .eq('user_id', userId)
        .gte('work_start', earliestDate.toISOString())
        .order('work_start', { ascending: false })

      if (error) {
        console.error('Failed to fetch attendance logs:', error)
        return
      }

      let weeklyStats = { total: 0, approved: 0, unapproved: 0 }
      let lastSevenDaysStats = { total: 0, approved: 0, unapproved: 0 }
      let monthlyStats = { total: 0, approved: 0, unapproved: 0 }

      attendanceLogs?.forEach(record => {
        if (!record.work_start || !record.work_end) return

        const workStart = new Date(record.work_start)
        const workEnd = new Date(record.work_end)
        
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

      // 給与計算
      const hourlyWage = profile?.hourly_wage || 0
      const minuteRate = hourlyWage / 60

      const incomeStats = {
        total: Math.floor(monthlyStats.total * minuteRate),
        approved: Math.floor(monthlyStats.approved * minuteRate),
        unapproved: Math.floor(monthlyStats.unapproved * minuteRate),
        hourlyWage: hourlyWage,
        currency: profile?.currency || 'JPY',
      }

      setStats({
        weekly: weeklyStats,
        lastSevenDays: lastSevenDaysStats,
        monthly: monthlyStats,
        income: incomeStats,
      })

      setLoading(false)
    }

    loadData()
  }, [userId, profile])

  if (loading) {
    return <div className="space-y-6 p-4"><Skeleton className="w-full h-[200px]" /></div>
  }

  return (
    <div className="px-4 max-w-7xl mx-auto">
      <div className="h-4 md:h-5" />
      
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
      </div>

      <Card className="mb-6 bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-800">
                {profile.english_name}
              </div>
              <Badge variant="outline">
                {profile.emp_id ? `EMP${profile.emp_id.toString().padStart(3, '0')}` : 'N/A'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                時給: ¥{profile.hourly_wage?.toLocaleString() || 'N/A'}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                在留資格: {profile.residence_status || 'N/A'}
              </Badge>
              {profile.expiration_date && (
                <Badge variant="secondary" className="px-3 py-1">
                  在留期限: {format(new Date(profile.expiration_date), 'yyyy/MM/dd')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              今週の勤務時間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1 space-y-3">
              <div className="text-2xl font-bold text-blue-600">
                {formatMinutesToHoursAndMinutes(stats.weekly.total)}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">承認済み</span>
                  <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.weekly.approved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">未承認</span>
                  <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.weekly.unapproved)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              直近7日間
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1 space-y-3">
              <div className="text-2xl font-bold text-purple-600">
                {formatMinutesToHoursAndMinutes(stats.lastSevenDays.total)}
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">承認済み</span>
                  <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.lastSevenDays.approved)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">未承認</span>
                  <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.lastSevenDays.unapproved)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-600" />
              今月の勤務と収入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1 space-y-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatMinutesToHoursAndMinutes(stats.monthly.total)}
                </div>
                <div className="text-sm space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">承認済み</span>
                    <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.monthly.approved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">未承認</span>
                    <span className="font-medium">{formatMinutesToHoursAndMinutes(stats.monthly.unapproved)}</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="text-xl font-bold text-green-600">
                  ¥{stats.income.total.toLocaleString()}
                </div>
                <div className="text-sm space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">承認済み</span>
                    <span className="font-medium">¥{stats.income.approved.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">未承認</span>
                    <span className="font-medium">¥{stats.income.unapproved.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-20" />
    </div>
  )
} 