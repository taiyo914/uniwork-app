export const calculateDateRanges = () => {
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