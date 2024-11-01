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
};

const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [],
  workStatus: "notStarted",
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  setWorkStatus: (status) => set({ workStatus: status }),

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

    set({
      records: attendanceLogs || [],
      workStatus: profileData?.work_status || 'notStarted',
    });
  },
}));

export default useAttendanceStore;

