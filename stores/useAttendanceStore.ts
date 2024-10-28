// stores/useAttendanceStore.ts
import { create } from "zustand";

type BreakLog = {
  id: number;
  break_start: string;
  break_end: string;
  manual_entry: boolean;
  memo: string;
  created_at: string;
  updated_at: string;
};

type AttendanceRecord = {
  id: number;
  user_id: number;
  work_start: string;
  work_end: string;
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
};

const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [
    // サンプルデータ
    {
      id: 1,
      user_id: 1,
      work_start: "2024-10-26T09:00:00Z",
      work_end: "2024-10-26T17:00:00Z",
      manual_entry: false,
      memo: "終了時メモ",
      approved: true,
      created_at: "2024-10-26T08:55:00Z",
      updated_at: "2024-10-26T17:05:00Z",
      break_logs: [
        {
          id: 101,
          break_start: "2024-10-26T12:00:00Z",
          break_end: "2024-10-26T12:30:00Z",
          manual_entry: false,
          memo: "昼食休憩",
          created_at: "2024-10-26T12:00:00Z",
          updated_at: "2024-10-26T12:30:00Z",
        },
        {
          id: 102,
          break_start: "2024-10-26T15:00:00Z",
          break_end: "2024-10-26T15:15:00Z",
          manual_entry: false,
          memo: "コーヒーブレイク",
          created_at: "2024-10-26T15:00:00Z",
          updated_at: "2024-10-26T15:15:00Z",
        },
      ],
    },
  ],
  workStatus: "notStarted",
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({ records: [record, ...state.records] })),
  setWorkStatus: (status) => set({ workStatus: status }),
}));

export default useAttendanceStore;

