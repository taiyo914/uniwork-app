'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CalendarDays, DollarSign, Calendar, CheckCircle, CircleAlert, Hourglass } from "lucide-react"

export default function Component() {
  const [showUSD, setShowUSD] = useState(false)
  const exchangeRate = 0.0068 // 1 JPY = 0.0068 USD
  const salaryJPY = 13200
  const salaryUSD = (salaryJPY * exchangeRate).toFixed(2)
  const approvedJPY = 7800
  const approvedUSD = (approvedJPY * exchangeRate).toFixed(2)
  const unapprovedJPY = 5400
  const unapprovedUSD = (unapprovedJPY * exchangeRate).toFixed(2)
  const hourlyRateJPY = 1200
  const hourlyRateUSD = (hourlyRateJPY * exchangeRate).toFixed(2)

  const formatCurrency = (amount: number, currency: 'JPY' | 'USD') => {
    return currency === 'JPY' ? `¥${amount.toLocaleString()}` : `$${(amount * exchangeRate).toFixed(2)}`
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 p-4 md:p-6 font-sans">
      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-base sm:text-lg font-medium">今週の勤務時間</CardTitle>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 lg:mt-0">4時間30分</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground">11/3(日) 〜 11/9(土)</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">2時間30分</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-blue-500" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">2時間00分</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-base sm:text-lg font-medium">直近7日間の勤務時間</CardTitle>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2 lg:mt-0">8時間30分</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground">11/2(土) 〜 11/8(金)</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">5時間00分</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-blue-500" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">3時間30分</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-6 items-start">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 w-full">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-base sm:text-lg font-medium">今月の勤務時間</CardTitle>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-2 lg:mt-0">11時間0分</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground">11/1(金) 〜 11/30(土)</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">6時間30分</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-blue-500" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">4時間30分</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 w-full">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-base sm:text-lg font-medium">今月の給与</CardTitle>
            </div>
            <div className="flex items-center space-x-2 mt-2 lg:mt-0">
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {showUSD ? `$${salaryUSD}` : `¥${salaryJPY.toLocaleString()}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUSD(!showUSD)}
                className="h-8 px-2 text-xs"
              >
                {showUSD ? 'JPY' : 'USD'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              
                <div className="text-xs sm:text-sm text-muted-foreground">
                  11時間0分 × {showUSD ? `$${hourlyRateUSD}` : `¥${hourlyRateJPY.toLocaleString()}`}/時
              </div>
               
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>承認済み</span>
                  </span>
                  <span className="font-semibold">{formatCurrency(approvedJPY, showUSD ? 'USD' : 'JPY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center space-x-1">
                    <Hourglass className="w-4 h-4 text-blue-500" />
                    <span>未承認</span>
                  </span>
                  <span className="font-semibold">{formatCurrency(unapprovedJPY, showUSD ? 'USD' : 'JPY')}</span>
                </div>
              {showUSD && (
                <div className="text-xs sm:text-sm text-muted-foreground text-right">
                  {` 1 USD = ${(1 / exchangeRate).toFixed(2)} JPY`}
                 </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`${showUSD ? "h-7" : "h-12" }`}></div>
    </div>
  )
}