"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlarmClock, Plus } from "lucide-react";
import useAttendanceStore from "@/stores/useAttendanceStore";

const ScheduledTimeDialog = () => {
  const { addRecord, records, workStatus } = useAttendanceStore();
  const [scheduledDate, setScheduledDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [breaks, setBreaks] = useState([{ start: "", end: "" }]);

  const handleAddBreak = () => {
    setBreaks([...breaks, { start: "", end: "" }]);
  };

  const validateInputs = () => {
    if (!scheduledDate || !workStart || !workEnd) return false;

    const start = new Date(`${scheduledDate}T${workStart}`).getTime();
    const end = new Date(`${scheduledDate}T${workEnd}`).getTime();
    if (start >= end) return false;

    for (let i = 0; i < breaks.length; i++) {
      const breakStart = new Date(`${scheduledDate}T${breaks[i].start}`).getTime();
      const breakEnd = new Date(`${scheduledDate}T${breaks[i].end}`).getTime();

      if (breakStart >= breakEnd || breakStart < start || breakEnd > end) return false;
    }
    return true;
  };

  const handleScheduledClockIn = () => {
    if (!validateInputs()) {
      alert("正しい入力をしてください。");
      return;
    }

    const timestamp = new Date().toISOString();
    const workStartTimestamp = new Date(`${scheduledDate}T${workStart}`).toISOString();
    const workEndTimestamp = new Date(`${scheduledDate}T${workEnd}`).toISOString();

    const newRecord = {
      id: records.length + 1,
      user_id: 1,
      work_start: workStartTimestamp,
      work_end: workEndTimestamp,
      manual_entry: true,
      memo: "",
      approved: false,
      created_at: timestamp,
      updated_at: timestamp,
      break_logs: breaks.map((b, idx) => ({
        id: idx + 1,
        break_start: new Date(`${scheduledDate}T${b.start}`).toISOString(),
        break_end: new Date(`${scheduledDate}T${b.end}`).toISOString(),
        manual_entry: true,
        memo: `休憩 ${idx + 1}`,
        created_at: timestamp,
        updated_at: timestamp,
      })),
    };

    addRecord(newRecord);
    setScheduledDate("");
    setWorkStart("");
    setWorkEnd("");
    setBreaks([{ start: "", end: "" }]);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`w-full h-20 border text-lg rounded-xl shadow flex items-center justify-center bg-gray-200 text-gray-700 transition-all duration-300
            ${workStatus !== "notStarted" ? "cursor-not-allowed" : "hover:bg-gray-300 "}
          `}
          disabled={workStatus !== "notStarted"}
        >
          <AlarmClock className="mb-0.5 h-5" />
          勤務時間を記録
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-center">勤務時間を記録</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">日付</label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2 ">
              <label className="text-sm font-medium">勤務開始時間</label>
              <Input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">勤務終了時間</label>
              <Input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">休憩時間</label>
            {breaks.map((b, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="time"
                  placeholder="開始"
                  value={b.start}
                  onChange={(e) => {
                    const updatedBreaks = [...breaks];
                    updatedBreaks[index].start = e.target.value;
                    setBreaks(updatedBreaks);
                  }}
                  required
                />
                <Input
                  type="time"
                  placeholder="終了"
                  value={b.end}
                  onChange={(e) => {
                    const updatedBreaks = [...breaks];
                    updatedBreaks[index].end = e.target.value;
                    setBreaks(updatedBreaks);
                  }}
                  required
                />
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" onClick={handleAddBreak}>
              <Plus className="mr-1" />
              休憩を追加
            </Button>
          </div>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center py-2 rounded-lg shadow-md"
            onClick={handleScheduledClockIn}
          >
            <AlarmClock className="h-5 w-5 mr-1" />
            記録を保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledTimeDialog;
