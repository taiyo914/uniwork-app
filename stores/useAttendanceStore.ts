// stores/useAttendanceStore.ts
import {create} from "zustand"

type WorkStatus = 'notStarted' | 'working' | 'onBreak'

type AttendanceRecord = {
  action: string;
  time: string;
  date: string;
}

type AttendanceStore = {
  records: AttendanceRecord[];
  workStatus: WorkStatus;
  addRecord: (record: AttendanceRecord) => void;
  setWorkStatus: (status: WorkStatus) => void;
};

const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [],
  workStatus: 'notStarted',
  addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
  setWorkStatus: (status) => set({ workStatus: status })
}));

export default useAttendanceStore;
