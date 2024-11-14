import { createClient } from "@/utils/supabase/server";
import AdminDashboard from "./AdminDashborad";

async function getEmployees() {
  const supabase = createClient();

  // 日付範囲の計算
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // プロフィールデータの取得
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      user_id,
      emp_id,
      english_name,
      image_url,
      residence_status,
      expiration_date,
      work_status,
      remarks
    `
    )
    .eq("role", "employee")
    .order("emp_id", { ascending: true });

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
    return [];
  }

  // 全従業員の勤怠データを取得（未承認のシフトカウント用に approved フィールドを追加）
  const { data: attendanceLogs, error: attendanceError } = await supabase
    .from("attendance_logs")
    .select(
      `
      user_id,
      work_start,
      work_end,
      approved,
      break_logs (
        break_start,
        break_end
      )
    `
    )
    .gte("work_start", startOfWeek.toISOString())
    .lte("work_start", endOfWeek.toISOString());

  if (attendanceError) {
    console.error("Error fetching attendance:", attendanceError);
    return [];
  }

  // 最終勤務日を取得（ユーザーごと）
  const { data: lastWorkDays, error: lastWorkDayError } = await supabase
    .from("attendance_logs")
    .select("user_id, work_start")
    .order("work_start", { ascending: false });

  if (lastWorkDayError) {
    console.error("Error fetching last work days:", lastWorkDayError);
    return [];
  }

  // ユーザーごとの最終勤務日をマッピング
  const lastWorkDayMap: { [key: string]: string } = {};
  lastWorkDays?.forEach((record) => {
    if (!record.user_id || !record.work_start) return;
    if (!lastWorkDayMap[record.user_id]) {
      lastWorkDayMap[record.user_id] = record.work_start.split("T")[0]; // YYYY-MM-DD 形式に変換
    }
  });

  // 従業員ごとの週間労働時間と未承認シフト数を計算
  const weeklyHours: { [key: string]: number } = {};
  const unapprovedShifts: { [key: string]: number } = {};

  attendanceLogs?.forEach((record) => {
    if (!record.user_id) return;

    // 未承認シフトのカウント
    if (!record.approved) {
      unapprovedShifts[record.user_id] = (unapprovedShifts[record.user_id] || 0) + 1;
    }

    // 週間労働時間の計算（既存のロジック）
    if (!record.work_start || !record.work_end) return;
    const workStart = new Date(record.work_start);
    const workEnd = new Date(record.work_end);

    const workMinutes = Math.round((workEnd.getTime() - workStart.getTime()) / (1000 * 60));

    let breakMinutes = 0;
    record.break_logs?.forEach((breakLog) => {
      if (breakLog.break_start && breakLog.break_end) {
        const breakStart = new Date(breakLog.break_start);
        const breakEnd = new Date(breakLog.break_end);
        breakMinutes += Math.round((breakEnd.getTime() - breakStart.getTime()) / (1000 * 60));
      }
    });

    const netWorkMinutes = workMinutes - breakMinutes;
    const netWorkHours = Number((netWorkMinutes / 60).toFixed(2));

    weeklyHours[record.user_id] = (weeklyHours[record.user_id] || 0) + netWorkHours;
  });

  // プロフィールデータと計算した値を結合
  return profiles.map((emp) => ({
    user_id: emp.user_id,
    emp_id: emp.emp_id,
    english_name: emp.english_name,
    weekly_hours: weeklyHours[emp.user_id] || 0,
    expiration_date: emp.expiration_date,
    image_url: emp.image_url || "/placeholder.svg?height=32&width=32",
    residence_status: emp.residence_status,
    unapproved_shifts: unapprovedShifts[emp.user_id] || 0,
    work_status: emp.work_status || "notStarted",
    last_work_day: lastWorkDayMap[emp.user_id] || null,
    remarks: emp.remarks,
  }));
}

export default async function AdminDashboardPage() {
  const employees = await getEmployees();

  return <AdminDashboard initialEmployees={employees} />;
}
