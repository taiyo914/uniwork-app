import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { Profile } from "@/types/profile";
import { Bell, Clock, DollarSign, Calendar, PlayCircle, PauseCircle, StopCircle, User, InfoIcon, Wallet, RefreshCw, Hourglass, CheckCircle, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import Notifications from "./Notifications";
import { fetchExchangeRate } from "@/utils/fetchExchangeRate";

const workStatusMap = {
  notStarted: { label: "勤務外", icon: StopCircle, color: "bg-gray-200" },
  working: { label: "勤務中", icon: PlayCircle, color: "bg-green-200" },
  onBreak: { label: "休憩中", icon: PauseCircle, color: "bg-yellow-200" },
};


// 分を「○○時間○○分」形式に変換する関数
const formatMinutesToHoursAndMinutes = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return `${hours}時間${minutes}分`;
};

const calculateDateRanges = () => {
  const now = new Date();
  // 現在の日付（時刻を 00:00:00 にリセット）
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 直近7日間（6日前の00:00から今日の23:59:59まで）
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); 
  const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) 

  // 今週（日曜日から土曜日の23:59:59まで）
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // 土曜日の23:59:59

  // 今月（1日から月末の23:59:59まで）
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // 月末の日付
  endOfMonth.setHours(23, 59, 59, 999); // 月末の23:59:59

  return {
    lastSevenDays: {
      start: sevenDaysAgo,
      end: endOfToday
    },
    thisWeek: {
      start: startOfWeek,
      end: endOfWeek
    },
    thisMonth: {
      start: startOfMonth,
      end: endOfMonth
    }
  };
};

// date-fnsを使用した日付フォーマット関数
const formatDateWithWeekday = (date: Date) => {
  return format(date, 'M/d (E)', { locale: ja });
};

// 月の表示用フォーマット関数を追加
const formatMonthDisplay = (date: Date) => {
  return format(date, 'M月', { locale: ja });
};

// 通貨変換用のヘルパー関数を追加
const convertCurrency = (amount: number, rate: number | null) => {
  if (!rate) return amount;

  if (rate < 1) {
    return Number((amount * rate).toFixed(2));
  } else {
    return Number(Math.floor(amount * rate));
  }
};

// 共通の統計情報の型
type Stats = {
  weekly: {
    total: number;
    approved: number;
    unapproved: number;
  };
  lastSevenDays: {
    total: number;
    approved: number;
    unapproved: number;
  };
  monthly: {
    total: number;
    approved: number;
    unapproved: number;
  };
  income: {
    total: number;
    approved: number;
    unapproved: number;
    hourlyWage: number;
    currency: string;
  };
};

// 為替レート表示用のヘルパー関数を追加
const formatExchangeRate = (rate: number | null, currency: string) => {
  if (!rate) return null;

  // rateが1より小さい場合: 1 (海外通貨) = 1 / rate (JPY)
  if (rate < 1) {
    return `1 ${currency} = ${(1 / rate).toFixed(2)} JPY`;
  } 
  // rateが1以上の場合: 1 JPY = rate (海外通貨)
  else {
    return `1 JPY = ${(rate).toFixed(2)} ${currency}`;
  }
};

export default function DashboardStats() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJPY, setShowJPY] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({
    weekly: { total: 0, approved: 0, unapproved: 0 },
    lastSevenDays: { total: 0, approved: 0, unapproved: 0 },
    monthly: { total: 0, approved: 0, unapproved: 0 },
    income: { total: 0, approved: 0, unapproved: 0, hourlyWage: 0, currency: 'JPY' },
  });
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      // プロフィール情報の取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('english_name, hourly_wage, work_status, currency')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch profile:', profileError);
        return;
      }

      setProfile(profileData as Profile);

      // 日付範囲の計算
      const dateRanges = calculateDateRanges();
      
      // 直近7日間と今週の計算のために、より広い範囲データを取得
      const earliestDate = new Date(Math.min(
        dateRanges.lastSevenDays.start.getTime(),
        dateRanges.thisWeek.start.getTime(),
        dateRanges.thisMonth.start.getTime()
      ));

      // 勤怠記録の取得
      const { data: attendanceLogs, error: attendanceError } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          work_start,
          work_end,
          memo,
          approved,
          created_at,
          break_logs (
            break_start,
            break_end,
            memo,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .gte('work_start', earliestDate.toISOString())
        .order('work_start', { ascending: false });

      if (attendanceError) {
        console.error('Failed to fetch attendance logs:', attendanceError);
        return;
      }

      let weeklyStats = { total: 0, approved: 0, unapproved: 0 };
      let lastSevenDaysStats = { total: 0, approved: 0, unapproved: 0 };
      let monthlyStats = { total: 0, approved: 0, unapproved: 0 };

      attendanceLogs?.forEach(record => {
        if (!record.work_start || !record.work_end) return;

        const workStart = new Date(record.work_start);
        const workEnd = new Date(record.work_end);
        
        // 勤務時間を分単位で計算
        const workMinutes = Math.round((workEnd.getTime() - workStart.getTime()) / (1000 * 60));
        let breakMinutes = 0;
        record.break_logs?.forEach(breakLog => {
          if (breakLog.break_start && breakLog.break_end) {
            const breakStart = new Date(breakLog.break_start);
            const breakEnd = new Date(breakLog.break_end);
            breakMinutes += Math.round((breakEnd.getTime() - breakStart.getTime()) / (1000 * 60));
          }
        });

        const netWorkMinutes = workMinutes - breakMinutes;

        // 直近7日間の計算
        if (workStart >= dateRanges.lastSevenDays.start && workStart <= dateRanges.lastSevenDays.end) {
          lastSevenDaysStats.total += netWorkMinutes;
          if (record.approved) {
            lastSevenDaysStats.approved += netWorkMinutes;
          } else {
            lastSevenDaysStats.unapproved += netWorkMinutes;
          }
        }

        // 今週の計算
        if (workStart >= dateRanges.thisWeek.start && workStart <= dateRanges.thisWeek.end) {
          weeklyStats.total += netWorkMinutes;
          if (record.approved) {
            weeklyStats.approved += netWorkMinutes;
          } else {
            weeklyStats.unapproved += netWorkMinutes;
          }
        }

        // 今月の計算
        if (workStart >= dateRanges.thisMonth.start && workStart <= dateRanges.thisMonth.end) {
          monthlyStats.total += netWorkMinutes;
          if (record.approved) {
            monthlyStats.approved += netWorkMinutes;
          } else {
            monthlyStats.unapproved += netWorkMinutes;
          }
        }
      });

      // 給与計算（時給を分給に変換して計算）
      const hourlyWage = profileData?.hourly_wage || 0;
      const minuteRate = hourlyWage / 60;

      // 収入の計算
      const incomeStats = {
        total: Math.floor(monthlyStats.total * minuteRate),
        approved: Math.floor(monthlyStats.approved * minuteRate),
        unapproved: Math.floor(monthlyStats.unapproved * minuteRate),
        hourlyWage: hourlyWage,
        currency: profileData?.currency || 'JPY',
      };

      setStats({
        weekly: weeklyStats,
        lastSevenDays: lastSevenDaysStats,
        monthly: monthlyStats,
        income: incomeStats,
      });

      setLoading(false);
    };

    loadData();
  }, [user?.id]);


  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="w-full h-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[250px]" />
          <Skeleton className="h-[250px]" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="px-4 max-w-7xl mx-auto font-sans">

        <div className="h-4 md:h-5"></div>

        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap ml-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-x-1">
            <User className="h-6 w-6" />{profile?.english_name || 'ゲスト'}
          </h1>
          <Badge 
            className={`${workStatusMap[profile?.work_status || 'notStarted'].color} 
              text-gray-800 flex items-center gap-1 px-2 py-1`}
          >
            {React.createElement(workStatusMap[profile?.work_status || 'notStarted'].icon, { className: "h-4 w-4" })}
            {workStatusMap[profile?.work_status || 'notStarted'].label}
          </Badge>
        </div>

        <div className="h-4 md:h-5 "></div>

        {/* 統計セクション */}
        <Notifications />

        <div className="h-5"></div>
       
        <div className="grid gap-4 lg:gap-5 sm:grid-cols-2">
          {/* 今週の勤務時間 */}
          <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-baseline sm:flex-col sm:items lg:flex-row lg:items-center justify-between pb-2 md:pb-1 px-4 sm:px-5 pt-4 sm:pt-5 gap-x-2">
              <div className="flex items-center space-x-1">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base sm:text-lg font-medium">今週の勤務時間</CardTitle>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 text-right whitespace-nowrap sm:w-full lg:w-auto">
                {formatMinutesToHoursAndMinutes(stats.weekly.total)}
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().thisWeek.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisWeek.end)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>承認済み</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.weekly.approved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Hourglass className="w-4 h-4 text-blue-500" />
                      <span>未承認</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.weekly.unapproved)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 直近7日間の勤務時間 */}
          <Card className="bg-purple-50/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-baseline sm:flex-col sm:items lg:flex-row lg:items-center justify-between pb-2 md:pb-1 px-4 sm:px-5 pt-4 sm:pt-5 gap-x-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-base sm:text-lg font-medium">直近7日間の勤務時間</CardTitle>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 text-right whitespace-nowrap sm:w-full lg:w-auto">
                {formatMinutesToHoursAndMinutes(stats.lastSevenDays.total)}
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().lastSevenDays.start)} ～ {formatDateWithWeekday(calculateDateRanges().lastSevenDays.end)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>承認済み</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.lastSevenDays.approved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Hourglass className="w-4 h-4 text-blue-500" />
                      <span>未承認</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.lastSevenDays.unapproved)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 lg:mt-5 flex flex-col sm:flex-row gap-4 lg:gap-5 items-start">
          {/* 今月の勤務時間 */}
          <Card className="bg-green-50/50 dark:bg-green-900/20 border-green-300 dark:border-green-800 w-full">
            <CardHeader className="flex flex-row items-baseline sm:flex-col sm:items lg:flex-row lg:items-center justify-between pb-2 md:pb-1 px-4 sm:px-5 pt-4 sm:pt-5 gap-x-2">
              <div className="flex items-center space-x-1">
                <CalendarDays className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-base sm:text-lg font-medium">今月の勤務時間</CardTitle>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 text-right whitespace-nowrap sm:w-full lg:w-auto">
                {formatMinutesToHoursAndMinutes(stats.monthly.total)}
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().thisMonth.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisMonth.end)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>承認済み</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.monthly.approved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Hourglass className="w-4 h-4 text-blue-500" />
                      <span>未承認</span>
                    </span>
                    <span className="font-semibold">{formatMinutesToHoursAndMinutes(stats.monthly.unapproved)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 w-full">
            <CardHeader className="flex flex-row items-baseline sm:flex-col sm:items lg:flex-row lg:items-center justify-between pb-2 md:pb-1 px-4 sm:px-5 pt-4 sm:pt-5 gap-x-2 relative">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-base sm:text-lg font-medium">今月の給与</CardTitle>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 text-right whitespace-nowrap sm:w-full lg:w-auto flex items-center ">
                {showJPY ? (
                  <div className="w-full ">
                    ¥{stats.income.total.toLocaleString()}
                   
                    {stats.income.currency !== 'JPY' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 hover:bg-orange-100 rounded-full hover:text-orange-800 -mr-1.5"
                              onClick={async () => {
                                if (!exchangeRate) {
                                  setIsLoadingRate(true);
                                  try {
                                    const rate = await fetchExchangeRate(stats.income.currency);
                                    setExchangeRate(rate);
                                  } finally {
                                    setIsLoadingRate(false);
                                  }
                                }
                                setShowJPY(false);
                              }}
                              disabled={isLoadingRate}
                            >
                              <RefreshCw className={`h-4 w-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stats.income.currency}で表示</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ) : (
                  <div className=" w-full">
                    <div >
                      {stats.income.currency} {convertCurrency(stats.income.total, exchangeRate).toLocaleString()}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 hover:bg-orange-100 rounded-full hover:text-orange-800 -mr-1.5"
                              onClick={() => setShowJPY(true)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>円で表示</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatMinutesToHoursAndMinutes(stats.monthly.total)} × {showJPY ? (
                    `¥${stats.income.hourlyWage.toLocaleString()}/時`
                  ) : (
                    `${stats.income.currency} ${convertCurrency(stats.income.hourlyWage, exchangeRate).toLocaleString()}/時`
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>承認済み</span>
                    </span>
                    <span className="font-semibold">
                      {showJPY ? (
                        `¥${stats.income.approved.toLocaleString()}`
                      ) : (
                        `${stats.income.currency} ${convertCurrency(stats.income.approved, exchangeRate).toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Hourglass className="w-4 h-4 text-blue-500" />
                      <span>未承認</span>
                    </span>
                    <span className="font-semibold">
                      {showJPY ? (
                        `¥${stats.income.unapproved.toLocaleString()}`
                      ) : (
                        `${stats.income.currency} ${convertCurrency(stats.income.unapproved, exchangeRate).toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {!showJPY && exchangeRate && (
                <div className="mt-2 pt-2 sm:pt-3 border-t border-amber-200 dark:border-amber-800 -mb-3">
                  <div className="flex justify-end text-sm text-muted-foreground font-medium">
                    {formatExchangeRate(exchangeRate, stats.income.currency)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="h-20"></div>

      </div>
    </TooltipProvider>
  );
} 