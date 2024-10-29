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
import { Textarea } from "@/components/ui/textarea";
import { AlarmClock, Plus, X } from "lucide-react";
import useAttendanceStore from "@/stores/useAttendanceStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ScheduledTimeDialog = () => {
  const { addRecord, records, workStatus } = useAttendanceStore();
  const [scheduledDate, setScheduledDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [workMemo, setWorkMemo] = useState("");
  const [breaks, setBreaks] = useState([{ start: "", end: "", memo: "" }]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAddBreak = () => {
    setBreaks([...breaks, { start: "", end: "", memo: "" }]);
  };

  const handleRemoveBreak = (index: number) => {
    const updatedBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(updatedBreaks);
  };

  const validateInputs = () => {
    const errors: string[] = [];

    if (!scheduledDate) errors.push("日付を入力してください。");
    if (!workStart) errors.push("勤務開始時間を入力してください。");
    if (!workEnd) errors.push("勤務終了時間を入力してください。");

    if (scheduledDate && workStart && workEnd) {
      const start = new Date(`${scheduledDate}T${workStart}`).getTime();
      const end = new Date(`${scheduledDate}T${workEnd}`).getTime();
      if (start >= end) errors.push("勤務終了時間は勤務開始時間より後である必要があります。");

      breaks.forEach((breakItem, index) => {
        if (breakItem.start && breakItem.end) {
          const breakStart = new Date(`${scheduledDate}T${breakItem.start}`).getTime();
          const breakEnd = new Date(`${scheduledDate}T${breakItem.end}`).getTime();

          if (breakStart >= breakEnd) {
            errors.push(`休憩${index + 1}の終了時間は開始時間より後である必要があります。`);
          }
          if (breakStart < start || breakEnd > end) {
            errors.push(`休憩${index + 1}は勤務時間内である必要があります。`);
          }
        } else if (breakItem.start || breakItem.end) {
          errors.push(`休憩${index + 1}の開始時間と終了時間の両方を入力してください。`);
        }
      });
    }

    const now = new Date();
    const workEndDate = new Date(`${scheduledDate}T${workEnd}`);
    if (workEndDate > now) {
      errors.push("勤務終了時間は現在時刻より後にすることはできません。");
    }

    for (let i = 0; i < breaks.length; i++) {
      for (let j = i + 1; j < breaks.length; j++) {
        const break1Start = new Date(`${scheduledDate}T${breaks[i].start}`).getTime();
        const break1End = new Date(`${scheduledDate}T${breaks[i].end}`).getTime();
        const break2Start = new Date(`${scheduledDate}T${breaks[j].start}`).getTime();
        const break2End = new Date(`${scheduledDate}T${breaks[j].end}`).getTime();

        if (
          (break1Start < break2End && break1End > break2Start) ||
          (break2Start < break1End && break2End > break1Start)
        ) {
          errors.push(`休憩${i + 1}と休憩${j + 1}の時間が重複しています。`);
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleScheduledClockIn = () => {
    if (!validateInputs()) {
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
      memo: workMemo,
      approved: false,
      created_at: timestamp,
      updated_at: timestamp,
      break_logs: breaks
        .filter((b) => b.start && b.end)
        .map((b, idx) => ({
          id: idx + 1,
          break_start: new Date(`${scheduledDate}T${b.start}`).toISOString(),
          break_end: new Date(`${scheduledDate}T${b.end}`).toISOString(),
          manual_entry: true,
          memo: b.memo,
          created_at: timestamp,
          updated_at: timestamp,
        })),
    };

    addRecord(newRecord);
    setScheduledDate("");
    setWorkStart("");
    setWorkEnd("");
    setWorkMemo("");
    setBreaks([{ start: "", end: "", memo: "" }]);
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
          <AlarmClock className="mb-0.5 h-5 mr-0.5" />
          過去の勤務時間を記録
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg p-8 xs:p-4 xs:py-6 max-w-2xl w-11/12">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-4 xs:mb-0">勤務時間を記録</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 max-h-[70vh] overflow-y-auto px-2 ">
          <div className="space-y-1">
            <label className="text-sm font-medium ml-0.5">日付</label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium ml-0.5">勤務開始時間</label>
              <Input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium ml-0.5">勤務終了時間</label>
              <Input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium ml-0.5">勤務メモ</label>
            <Textarea
              value={workMemo}
              onChange={(e) => setWorkMemo(e.target.value)}
              placeholder="勤務に関するメモを入力してください"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium ml-0.5 ">休憩時間</label>
            <div className="space-y-3">
              {breaks.map((b, index) => (
                <div key={index} className="p-4 pt-[0.65rem] pb-4 bg-gray-50 rounded-lg relative border">
                  <X className="h-6 w-6 absolute top-2 right-2 rounded-full hover:bg-gray-200 hover:cursor-pointer p-1 text-gray-500 transition duration-300"  onClick={() => handleRemoveBreak(index)}/>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs ml-0.5">{`休憩開始時間`}</label>
                        <Input
                          type="time"
                          value={b.start}
                          onChange={(e) => {
                            const updatedBreaks = [...breaks];
                            updatedBreaks[index].start = e.target.value;
                            setBreaks(updatedBreaks);
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs ml-0.5">{`休憩終了時間`}</label>
                        <Input
                          type="time"
                          value={b.end}
                          onChange={(e) => {
                            const updatedBreaks = [...breaks];
                            updatedBreaks[index].end = e.target.value;
                            setBreaks(updatedBreaks);
                          }}
                          required
                        />
                      </div>
                    </div>
                    <Textarea
                      value={b.memo}
                      onChange={(e) => {
                        const updatedBreaks = [...breaks];
                        updatedBreaks[index].memo = e.target.value;
                        setBreaks(updatedBreaks);
                      }}
                      placeholder={`休憩${index + 1}に関するメモを入力してください`}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center pt-2">
              <Button variant="outline" className="text-xs" size="sm" onClick={handleAddBreak}>
                <Plus className="mr-0.5 h-3 w-3" />
                休憩を追加
              </Button>
            </div>
          </div>
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
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
