"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlarmClock } from "lucide-react";
import useAttendanceStore from "@/stores/useAttendanceStore";

const ScheduledTimeDialog = () => {
  const { addRecord } = useAttendanceStore();
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledType, setScheduledType] = useState("勤務開始");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleScheduledClockIn = () => {
    if (scheduledDate && scheduledTime && scheduledType) {
      const newRecord = {
        action: scheduledType,
        time: scheduledTime,
        date: scheduledDate,
      };
      addRecord(newRecord);
      setScheduledDate("");
      setScheduledTime("");
      setScheduledType("勤務開始");
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center h-20 rounded-xl text-lg transition-all duration-300 hover:scale-[1.01] shadow">
          <AlarmClock className="mr-1" />
          指定時間で打刻
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center">指定時間打刻</DialogTitle>
        </DialogHeader>
        <div className="space-y-9 py-2">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-1 ">
                日付
              </label>
              <input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="border w-full px-2 py-1.5 rounded-lg "
              />
            </div>
            <div>
              <label htmlFor="scheduled-time" className="block text-sm font-medium text-gray-700 mb-1">
                時間
              </label>
              <input
                id="scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="border w-full px-2 py-1.5 rounded-lg "
              />
            </div>
            <div>
              <label htmlFor="scheduled-type" className="block text-sm font-medium text-gray-700 mb-1">
                種類
              </label>
              <select
                id="scheduled-type"
                value={scheduledType}
                onChange={(e) => setScheduledType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[0.6rem] text-sm "
              >
                <option>勤務開始</option>
                <option>勤務終了</option>
                <option>休憩開始</option>
                <option>休憩終了</option>
              </select>
            </div>
          </div>
          <button onClick={handleScheduledClockIn} className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center py-2 rounded-lg shadow-md">
            <AlarmClock className="h-5 w-5 mb-0.5 mr-1" />
            指定時間で打刻
          </button>
        </div>
      </DialogContent>
  </Dialog>
  );
};

export default ScheduledTimeDialog;
