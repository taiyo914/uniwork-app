"use client"

import React from 'react'
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, DollarSign, Calendar, CheckCircle, Hourglass } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface EmployeeStatistics {
  weeklyHours: { approved: number; unapproved: number }
  monthlyHours: { approved: number; unapproved: number }
  weeklyWage: { approved: number; unapproved: number }
  monthlyWage: { approved: number; unapproved: number }
  hourlyRate: number
  recentWeekHours: number
}

export function StatisticsTab({ stats }: { stats: EmployeeStatistics }) {
  const totalWeeklyHours = stats.weeklyHours.approved + stats.weeklyHours.unapproved
  const totalMonthlyHours = stats.monthlyHours.approved + stats.monthlyHours.unapproved
  const totalWeeklyWage = stats.weeklyWage.approved + stats.weeklyWage.unapproved
  const totalMonthlyWage = stats.monthlyWage.approved + stats.monthlyWage.unapproved
  const weeklyProgress = (stats.recentWeekHours / 28) * 100

  return (
    <TooltipProvider>
      <div className=" ">
        
        <div className="">
          <h3 className="text-lg font-semibold mb-2 flex items-center ml-0.5">
            <Calendar className="mr-2 w-5 h-5 mb-0.5" />
            直近7日間の労働時間
          </h3>
          <p className="text-sm text-gray-500 mb-4 ml-0.5">
            在留資格が「留学生」や「家族滞在」の場合、連続7日間の上限は28時間です。
          </p>
          <div className="p-4 pb-8 rounded-lg border border-gray-200 shadow-sm font-sans">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{stats.recentWeekHours.toFixed(1)} / 28 時間</span>
              <span className="font-medium">{(28 - stats.recentWeekHours).toFixed(1)}時間 残り</span>
            </div>
            <Progress 
              value={weeklyProgress} 
              className={`h-2 w-full bg-gray-200 ${
                weeklyProgress <= 50 
                  ? '[&>div]:bg-green-500'
                  : weeklyProgress <= 80
                    ? '[&>div]:bg-yellow-500' 
                    : '[&>div]:bg-red-500'
              }`} 
            />
          </div>
        </div>

        <div className='h-5'></div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Clock className="mr-2 w-5 h-5 mb-0.5" />
          労働時間
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 font-sans">
          {/* 今週の勤務時間 */}
          <Card>
            <CardHeader className="flex flex-row items-baseline justify-between pb-3 px-4 pt-4 gap-x-2">
              <div className="flex items-center space-x-1">
                <Clock className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-medium">今週</CardTitle>
              </div>
              <div className="text-2xl font-bold text-right whitespace-nowrap">
                {totalWeeklyHours}時間
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">{stats.weeklyHours.approved}時間</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-gray-600" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">{stats.weeklyHours.unapproved}時間</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 今月の勤務時間 */}
          <Card>
            <CardHeader className="flex flex-row items-baseline justify-between pb-3 px-4 pt-4 gap-x-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-base font-medium">今月</CardTitle>
              </div>
              <div className="text-2xl font-bold text-right whitespace-nowrap">
                {totalMonthlyHours}時間
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">{stats.monthlyHours.approved}時間</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-gray-600" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">{stats.monthlyHours.unapproved}時間</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-lg font-semibold mb-2 mt-4 flex items-center">
          <DollarSign className="mr-2 w-5 h-5 mb-0.5" />
          給与
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start font-sans">
          {/* 今月の給与 */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-baseline justify-between pb-3 px-4 pt-4 gap-x-2">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-base font-medium">今月の給与</CardTitle>
              </div>
              <div className="text-2xl font-bold text-right whitespace-nowrap">
                ¥{totalMonthlyWage.toLocaleString()}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">¥{stats.monthlyWage.approved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-gray-600" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">¥{stats.monthlyWage.unapproved.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>時給</span>
                  </span>
                  <span className="font-semibold">¥{stats.hourlyRate.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </TooltipProvider>
  )
}
