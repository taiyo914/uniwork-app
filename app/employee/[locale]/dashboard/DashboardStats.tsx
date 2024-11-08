import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";
import type { Profile } from "@/types/profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Clock, DollarSign, Calendar, PlayCircle, PauseCircle, StopCircle, User, InfoIcon, Wallet, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// ダミーの通知データを増やす
const generateNotifications = () => {
  const types = ["warning", "info", "success"] as const;
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: [
      "休憩時間超過注意",
      "勤務時間報告",
      "承認完了のお知せ",
      "システムメンテナンス予定",
      "給与振込完了",
    ][i % 5],
    message: [
      "本日の休憩時間が1時間を超えています",
      "先週の勤務時間が確定しました",
      "3月分の勤務時間が承認されました",
      "明日午前2時からメンテナンスを実施します",
      "今月分の給与が振り込まれました",
    ][i % 5],
    createdAt: new Date(2024, 2, 20 - i),
    type: types[i % 3],
  }));
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

export default function DashboardStats() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    weeklyMinutes: 0,
    monthlyMinutes: 0,
    monthlyApprovedMinutes: 0,
    expectedIncomeApproved: 0,
    expectedIncomeTotal: 0,
    lastSevenDaysMinutes: 0,
  });
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode | null>(null);

  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  const notifications = generateNotifications();

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
      
      // 直近7日間と今週の計算のために、より広い範囲のデータを取得
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

      setAttendanceLogs(attendanceLogs);

      let lastSevenDaysTotal = 0;
      let weeklyTotal = 0;
      let monthlyTotalApproved = 0;
      let monthlyTotalAll = 0;
      let monthlyApprovedMinutes = 0;

      attendanceLogs?.forEach(record => {
        if (!record.work_start || !record.work_end) return;

        const workStart = new Date(record.work_start);
        const workEnd = new Date(record.work_end);
        
        // 勤務時間を分単位で計算
        const workMinutes = Math.round((workEnd.getTime() - workStart.getTime()) / (1000 * 60));

        // 休憩時間を分単位で計算
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
          lastSevenDaysTotal += netWorkMinutes;
        }

        // 今週の計算
        if (workStart >= dateRanges.thisWeek.start && workStart <= dateRanges.thisWeek.end) {
          weeklyTotal += netWorkMinutes;
        }

        // 今月の承認済み時間を計算
        if (workStart >= dateRanges.thisMonth.start && workStart <= dateRanges.thisMonth.end) {
          if (record.approved) {
            monthlyApprovedMinutes += netWorkMinutes;
            monthlyTotalApproved += netWorkMinutes;
          }
          monthlyTotalAll += netWorkMinutes;
        }
      });

      // 給与計算（時給を分給に変換して計算）
      const minuteRate = (profileData?.hourly_wage || 0) / 60;

      setStats({
        lastSevenDaysMinutes: lastSevenDaysTotal,
        weeklyMinutes: weeklyTotal,
        monthlyMinutes: monthlyTotalAll,
        monthlyApprovedMinutes,
        expectedIncomeApproved: Math.floor(monthlyTotalApproved * minuteRate),
        expectedIncomeTotal: Math.floor(monthlyTotalAll * minuteRate),
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
            <CardHeader className="gap-2 bg-blue-100 py-4">
              <h2 className="text-lg font-bold text-blue-800"> <Bell className="h-5 w-5 text-blue-600 inline mb-1 mr-1" />通知・お知らせ</h2>
            </CardHeader>
            <CardContent className="max-h-[250px] overflow-y-auto bg-gray-50/40 px-4">
              <div className="space-y-3 pt-4">
                {notifications.map(notification => (
                  <Alert 
                    key={notification.id} 
                    variant={notification.type === "warning" ? "destructive" : 
                            notification.type === "success" ? "success" : "default"}
                    className=""
                  >
                    <AlertTitle className="font-bold">{notification.title}</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <span>{notification.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { locale: ja, addSuffix: true })}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="h-5"></div>

        {/* 統計セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 勤務時間セクション */}
          <Card className="border-blue-100">
            <CardHeader className=" gap-2 bg-green-100 rounded-t-lg py-3">
              <h3 className="text-lg font-bold text-green-800"> <Clock className="h-5 w-5 text-green-600 inline mr-1 mb-1" />勤務時間</h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">

              <div className="grid grid-cols-2 sm:grid-cols-2 items-center">
                <h4 className="">
                  <span className="font-semibold text-gray-700 block">今月</span>
                  <span className="text-xs text-gray-500 block">
                    {formatDateWithWeekday(calculateDateRanges().thisMonth.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisMonth.end)}
                  </span>
                </h4>
                <p className="text-2xl font-bold text-blue-600 text-right">
                  {formatMinutesToHoursAndMinutes(stats.monthlyMinutes)}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 items-center">
                <h4 className="">
                  <span className="font-semibold text-gray-700 block">今週</span>
                  <span className="text-xs text-gray-500 block">
                    {formatDateWithWeekday(calculateDateRanges().thisWeek.start)} ～ {formatDateWithWeekday(calculateDateRanges().thisWeek.end)}
                  </span>
                </h4>
                <p className="text-2xl font-bold text-blue-600 text-right">
                  {formatMinutesToHoursAndMinutes(stats.weeklyMinutes)}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 items-center">
                <h4 className="">
                  <span className="font-semibold text-gray-700 block">直近7日間</span>
                  <span className="text-xs text-gray-500 block">
                    {formatDateWithWeekday(calculateDateRanges().lastSevenDays.start)} ～ {formatDateWithWeekday(calculateDateRanges().lastSevenDays.end)}
                  </span>
                </h4>
                <p className="text-2xl font-bold text-blue-600 text-right">
                  {formatMinutesToHoursAndMinutes(stats.lastSevenDaysMinutes)}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* 給与見込みセクション */}
          <Card className="border-orange-100">
            <CardHeader className="gap-2 bg-yellow-100 rounded-t-lg py-3">
              <h3 className="text-lg font-bold text-yellow-800">
                <Wallet className="h-5 w-5 text-yellow-600 inline mr-1 mb-1" />
                {formatMonthDisplay(calculateDateRanges().thisMonth.start)}の給与見込み
              </h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 items-center">
                <div>
                  <h4 className="font-semibold text-gray-700">承認済み</h4>
                  <p className="text-xs text-gray-500">
                    {formatMinutesToHoursAndMinutes(stats.monthlyApprovedMinutes)} × ¥{profile?.hourly_wage}/時
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">
                    ¥{stats.expectedIncomeApproved.toLocaleString()}
                  </p>
                  {selectedCurrency && (
                    <p className="text-sm text-gray-600">
                      ({selectedCurrency} {convertCurrency(stats.expectedIncomeApproved, selectedCurrency)})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 items-center">
                <div>
                  <h4 className="font-semibold text-gray-700">未承認も含む</h4>
                  <p className="text-xs text-gray-500">
                    {formatMinutesToHoursAndMinutes(stats.monthlyMinutes)} × ¥{profile?.hourly_wage}/時
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">
                    ¥{stats.expectedIncomeTotal.toLocaleString()}
                  </p>
                  {selectedCurrency && (
                    <p className="text-sm text-gray-600">
                      ({selectedCurrency} {convertCurrency(stats.expectedIncomeTotal, selectedCurrency)})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                {Object.keys(exchangeRates).map((currency) => (
                  <Button
                    key={currency}
                    variant={selectedCurrency === currency ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCurrency(currency as CurrencyCode)}
                    className="flex items-center gap-1"
                  >
                    <span>{currency}</span>
                    {selectedCurrency === currency && <RefreshCw className="h-3 w-3" />}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-10"></div>
      </div>
    </TooltipProvider>
  );
} 