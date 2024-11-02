// stores/useAttendanceStore.ts
import { create } from "zustand";
import { supabase } from "@/utils/supabase/client";

export type BreakLog = {
  id: number;
  break_start: string | null;
  break_end: string | null;
  memo: string;
  created_at: string;
  updated_at: string;
};

export type AttendanceRecord = {
  id: number;
  user_id: number;
  work_start: string | null;
  work_end: string | null;
  manual_entry: boolean;
  memo: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
  break_logs: BreakLog[];
};

type AttendanceStore = {
  records: AttendanceRecord[];
  workStatus: "notStarted" | "working" | "onBreak";
  setRecords: (records: AttendanceRecord[]) => void; 
  addRecord: (record: AttendanceRecord) => void;
  setWorkStatus: (status: "notStarted" | "working" | "onBreak") => void;
  loadInitialData: (userId:string) => void;
  totalBreakTime: number; // 新しいプロパティとして追加
  setTotalBreakTime: (time: number) => void; // 追加
};

const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [],
  workStatus: "notStarted",
  totalBreakTime: 0,
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  setWorkStatus: (status) => set({ workStatus: status }),
  setTotalBreakTime: (time) => set({ totalBreakTime: time }), // 追加

  loadInitialData: async (userId: string) => {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('work_status')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Failed to get work_status (loadInitialData):', profileError.message);
      return;
    }

    const { data: attendanceLogs, error: attendanceError } = await supabase
      .from('attendance_logs')
      .select('*, break_logs(*)')
      .eq('user_id', userId)
      .gte('work_start', lastMonth.toISOString())
      .order('work_start', { ascending: false });

    if (attendanceError) {
      console.error('Failed to get attendance_logs (loadInitialData):', attendanceError.message);
      return;
    }

    const sortedAttendanceLogs = attendanceLogs?.map((record) => {
      if (record.break_logs) {
        record.break_logs = record.break_logs.sort((a:any, b:any) => 
          new Date(a.break_start).getTime() - new Date(b.break_start).getTime()
        );
      }
      return record;
    });

    let calculatedTotalBreakTime = 0;
    if (attendanceLogs && attendanceLogs.length > 0) {
      const latestRecord = attendanceLogs[0];
      if (latestRecord.break_logs) {
        calculatedTotalBreakTime = latestRecord.break_logs.reduce((acc:number, log:BreakLog) => {
          if (log.break_start ) {
            const breakStart = new Date(log.break_start).getTime();
            const breakEnd = log.break_end ? new Date(log.break_end).getTime() : Date.now();
            return acc + Math.floor((breakEnd - breakStart) / 1000); // 秒単位で加算
          }
          return acc;
        }, 0);
      }
    }

    set({
      records: sortedAttendanceLogs || [],
      workStatus: profileData?.work_status || 'notStarted',
      totalBreakTime: calculatedTotalBreakTime,
    });
  },
}));

export default useAttendanceStore;

