import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { Profile } from "@/types/profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Clock, DollarSign, Calendar, PlayCircle, PauseCircle, StopCircle, User, InfoIcon, Wallet, RefreshCw, Hourglass, CheckCircle, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// 通知データを配列として直接定義
const notifications = [
  {
    id: 1,
    title: "休憩時間超過注意",
    message: "本日の休憩時間が1時間を超えています",
    createdAt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000), // 2時間前
    type: "warning" as const,
  },
  {
    id: 2,
    title: "勤務時間報告",
    message: "先週の勤務時間が確定しました",
    createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1日前
    type: "info" as const,
  },
  {
    id: 3,
    title: "承認完了のお知らせ",
    message: "3月分の勤務時間が承認されました",
    createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3日前
    type: "success" as const,
  },
  {
    id: 4,
    title: "システムメンテナンス予定",
    message: "明日午前2時からメンテナンスを実施します",
    createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5日前
    type: "info" as const,
  },
  {
    id: 5,
    title: "給与振込完了",
    message: "今月分の給与が振り込まれました",
    createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7日前
    type: "success" as const,
  },
  {
    id: 6,
    title: "古い通知",
    message: "これは古い通知です。",
    createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 40日前
    type: "info" as const,
  },
  {
    id: 7,
    title: "古い通知",
    message: "これは古い通知です。",
    createdAt: new Date(new Date().getTime() - 40 * 24 * 60 * 60 * 1000), // 40日前
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

const workStatusMap = {
  notStarted: { label: "勤務外", icon: StopCircle, color: "bg-gray-200" },
  working: { label: "勤務中", icon: PlayCircle, color: "bg-green-200" },
  onBreak: { label: "休憩中", icon: PauseCircle, color: "bg-yellow-200" },
};

// 為替レート（実際のアプリケーションでは外部APIから取得）
const exchangeRates = {
  USD: 0.0067,
  EUR: 0.0062,
  KRW: 8.89,
  TWD: 0.21,
};

type CurrencyCode = keyof typeof exchangeRates;

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
  };
};

export default function DashboardStats() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    weekly: { total: 0, approved: 0, unapproved: 0 },
    lastSevenDays: { total: 0, approved: 0, unapproved: 0 },
    monthly: { total: 0, approved: 0, unapproved: 0 },
    income: { total: 0, approved: 0, unapproved: 0, hourlyWage: 0 },
  });
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

  const calculateTimeRange = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    return { now, oneWeekAgo };
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      // プロフィール情報の取得
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('english_name, hourly_wage, work_status')
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

  const convertCurrency = (amount: number, currency: CurrencyCode) => {
    return Math.round(amount * exchangeRates[currency] * 100) / 100;
  };

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

        {/* 通知セクション */}
        <section className="w-full shadow rounded-xl overflow-hidden">
          <Card className="border-none">
            <CardHeader className="gap-2 bg-blue-100 py-4 px-4 md:px-5">
              <h2 className="text-lg font-bold text-blue-800">
                <Bell className="h-5 w-5 text-blue-600 inline mb-1 mr-1" />通知・お知らせ
              </h2>
            </CardHeader>
            <CardContent className="max-h-[250px] overflow-y-auto bg-gray-50/40 px-3 md:px-4">
              <div className="space-y-2.5 md:space-y-3 pt-3 md:pt-4">
                {notifications.map(notification => (
                  <Alert 
                    key={notification.id} 
                    variant={notification.type === "warning" ? "destructive" : 
                            notification.type === "success" ? "success" : "default"}
                  >
                    <AlertTitle className="flex justify-between items-center">
                      <div className="flex-1 truncate pr-4">
                        {notification.title}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                    </AlertTitle>
                    <AlertDescription>
                      {notification.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="h-5"></div>

        {/* 統計セクション */}
       
        <div className="grid gap-4 lg:gap-5 sm:grid-cols-2">
          {/* 今週の勤務時間 */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
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
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().thisWeek.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisWeek.end)}
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
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
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200/70 dark:border-purple-800">
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
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().lastSevenDays.start)} ～ {formatDateWithWeekday(calculateDateRanges().lastSevenDays.end)}
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
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
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 w-full">
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
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDateWithWeekday(calculateDateRanges().thisMonth.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisMonth.end)}
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
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

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200/70 dark:border-amber-800 w-full">
            <CardHeader className="flex flex-row items-baseline sm:flex-col sm:items lg:flex-row lg:items-center justify-between pb-2 md:pb-1 px-4 sm:px-5 pt-4 sm:pt-5 gap-x-2">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-base sm:text-lg font-medium">今月の給与</CardTitle>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 text-right whitespace-nowrap sm:w-full lg:w-auto">
                ¥{stats.income.total.toLocaleString()}
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5">
              <div className="space-y-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatMinutesToHoursAndMinutes(stats.monthly.total)} × ¥{stats.income.hourlyWage.toLocaleString()}/時
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>承認済み</span>
                    </span>
                    <span className="font-semibold">¥{stats.income.approved.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <Hourglass className="w-4 h-4 text-blue-500" />
                      <span>未承認</span>
                    </span>
                    <span className="font-semibold">¥{stats.income.unapproved.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-12"></div>

      </div>
    </TooltipProvider>
  );
} 