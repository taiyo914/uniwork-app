"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, CalendarPlus} from "lucide-react";
import useAttendanceStore from "@/stores/useAttendanceStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/utils/supabase/client";
import { useTranslation } from 'react-i18next';

type DateTimeInput = {
  date: string;
  time: string;
};

type Break = {
  start: DateTimeInput;
  end: DateTimeInput;
  memo: string;
};

const ScheduledTimeDialog = () => {
  const { t:translate } = useTranslation();
  const t = (key: string, params?: Record<string, any>) => translate(`timelog.scheduledTimeDialog.${key}`, params);
  const tv = (key: string, params?: Record<string, any>) => translate(`timelog.scheduledTimeDialog.validation.${key}`, params);
  const { addRecord, records, workStatus } = useAttendanceStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workStart, setWorkStart] = useState<DateTimeInput>({ date: "", time: "" });
  const [workEnd, setWorkEnd] = useState<DateTimeInput>({ date: "", time: "" });
  const [workMemo, setWorkMemo] = useState("");
  const [breaks, setBreaks] = useState<Break[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleAddBreak = () => {
    setBreaks([...breaks, { start: { date: "", time: "" }, end: { date: "", time: "" }, memo: "" }]);
  };

  const handleRemoveBreak = (index: number) => {
    const updatedBreaks = breaks.filter((_, i) => i !== index);
    setBreaks(updatedBreaks);
  };

  const handleWorkDateTimeChange = (
    field: 'start' | 'end',
    type: 'date' | 'time',
    value: string
  ) => {
    const setter = field === 'start' ? setWorkStart : setWorkEnd;
    const otherField = field === 'start' ? workEnd : workStart;

    setter(prev => ({ ...prev, [type]: value }));

    if (otherField.date === "" && type === 'date') {
      const otherSetter = field === 'start' ? setWorkEnd : setWorkStart;
      otherSetter(prev => ({ ...prev, date: value }));
    }

    if (otherField.time === "" && type === 'time') {
      const otherSetter = field === 'start' ? setWorkEnd : setWorkStart;
      otherSetter(prev => ({ ...prev, time: value }));
    }
  };

  const handleBreakDateTimeChange = (
    breakIndex: number,
    field: 'start' | 'end',
    type: 'date' | 'time',
    value: string
  ) => {
    const updatedBreaks = [...breaks];
    updatedBreaks[breakIndex][field][type] = value;

    const otherField = field === 'start' ? 'end' : 'start';
    if (updatedBreaks[breakIndex][otherField][type] === "") {
      updatedBreaks[breakIndex][otherField][type] = value;
    }

    setBreaks(updatedBreaks);
  };

  const validateInputs = () => {
    const errors: string[] = [];

    if (!workStart.date || !workStart.time) errors.push(tv("enterWorkStart"));
    if (!workEnd.date || !workEnd.time) errors.push(tv("enterWorkEnd"));

    if (workStart.date && workStart.time && workEnd.date && workEnd.time) {
      const start = new Date(`${workStart.date}T${workStart.time}`).getTime();
      const end = new Date(`${workEnd.date}T${workEnd.time}`).getTime();
      if (start >= end) errors.push(tv("endAfterStart"));

      breaks.forEach((breakItem, index) => {
        if (!breakItem.start.date || !breakItem.start.time) {
          errors.push(tv("enterBreakStart", { index: index + 1 }));
        }
        // 終了日時が未入力の場合のエラー
        if (!breakItem.end.date || !breakItem.end.time) {
          errors.push(tv("enterBreakEnd", { index: index + 1 }));
        }

        if (breakItem.start.date && breakItem.start.time && breakItem.end.date && breakItem.end.time) {
          const breakStart = new Date(`${breakItem.start.date}T${breakItem.start.time}`).getTime();
          const breakEnd = new Date(`${breakItem.end.date}T${breakItem.end.time}`).getTime();

          if (breakStart >= breakEnd) {
            errors.push(tv("breakEndAfterStart", {index: index+1}));
          }
          if (breakStart < start || breakEnd > end) {
            errors.push(tv("breakWithinWork", {index: index+1}));
          }
        }
      });
    }

    const now = new Date();
    const workEndDate = new Date(`${workEnd.date}T${workEnd.time}`);
    if (workEndDate > now) {
      errors.push(tv("endNotFuture"));
    }

    for (let i = 0; i < breaks.length; i++) {
      for (let j = i + 1; j < breaks.length; j++) {
        const break1Start = new Date(`${breaks[i].start.date}T${breaks[i].start.time}`).getTime();
        const break1End = new Date(`${breaks[i].end.date}T${breaks[i].end.time}`).getTime();
        const break2Start = new Date(`${breaks[j].start.date}T${breaks[j].start.time}`).getTime();
        const break2End = new Date(`${breaks[j].end.date}T${breaks[j].end.time}`).getTime();

        if (
          (break1Start < break2End && break1End > break2Start) ||
          (break2Start < break1End && break2End > break1Start)
        ) {
          errors.push(tv("overlappingBreaks", { index1: i + 1, index2: j + 1 }));
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleScheduledClockIn = async () => {
    if (!validateInputs()) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("Failed to get user (ScheduledTimeDialog/handleScheduledClockIn)");
      return;
    }

    const timestamp = new Date().toISOString();
    const workStartTimestamp = new Date(`${workStart.date}T${workStart.time}`).toISOString();
    const workEndTimestamp = new Date(`${workEnd.date}T${workEnd.time}`).toISOString();

    try{
      const { data: newRecord, error: attendanceError } = await supabase
        .from("attendance_logs")
        .insert({
          user_id: user.id,
          work_start: workStartTimestamp,
          work_end: workEndTimestamp,
          manual_entry: true,
          memo: workMemo,
          approved: false,
        })
        .select('*, break_logs(*)')
        .single();

      if (attendanceError) {
        console.error("Failed to insert attendance log:", attendanceError.message);
        return;
      }

      // 2. 挿入された勤務記録のIDを使用して休憩記録をSupabaseに挿入
      const breakLogsData = breaks
        .filter((b) => b.start.date && b.start.time && b.end.date && b.end.time)
        .map((b) => ({
          attendance_log_id: newRecord.id,
          break_start: new Date(`${b.start.date}T${b.start.time}`).toISOString(),
          break_end: new Date(`${b.end.date}T${b.end.time}`).toISOString(),
          memo: b.memo,
        }));

      if (breakLogsData.length > 0) {
        const { error: breakError } = await supabase.from("break_logs").insert(breakLogsData);
        if (breakError) {
          console.error("Failed to insert break logs:", breakError.message);
          return;
        }
      }

      // 3. Zustandストアに新しい勤務記録を追加
      const updatedRecord = {
        ...newRecord,
        break_logs: breakLogsData, 
      };
      addRecord(updatedRecord);
      
      resetForm();
      setIsDialogOpen(false);

    }catch (error){
      console.error("An error occurred while saving the scheduled record:", error);
    }
  };

  const resetForm = () => {
    setWorkStart({ date: "", time: "" });
    setWorkEnd({ date: "", time: "" });
    setWorkMemo("");
    setBreaks([]);
    setValidationErrors([]);
  };

  useEffect(() => {
    if (!isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen]);

  const DateTimeInputGroup = ({ label, dateValue, timeValue, onDateChange, onTimeChange }: {
    label: string;
    dateValue: string;
    timeValue: string;
    onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium ml-0.5">{label}</label>
      <div className="grid grid-cols-2 gap-[1.6px] border rounded-md bg-background">
        <div className="w-full">
          <input
            type="date"
            value={dateValue}
            onChange={onDateChange}
            required
            className="flex w-full px-3 py-2 h-10 rounded-md focus:outline outline-[1.5px] outline-gray-900 "
          />
        </div>
        <div className="w-full">
          <input
            type="time"
            value={timeValue}
            onChange={onTimeChange}
            required
            className="flex w-full px-3 py-1 h-10 rounded-md focus:outline outline-[1.5px] outline-gray-900"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
      <DialogTrigger asChild>
        <Button 
          className={`w-full h-16 lg:h-[4.5rem] border border-gray-300 text-base sm:text-lg rounded-md shadow flex items-center justify-center bg-gray-200 text-gray-700 transition-all duration-300
            ${workStatus !== "notStarted" ? "cursor-not-allowed" : "hover:bg-gray-300 "}
          `}
          disabled={workStatus !== "notStarted"}
        >
          <CalendarPlus className="mb-0.5 h-4 w-4 sm:h-5 sm:w-5 mr-0.5" />
          {t("recordPastWorkTime")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg p-8 xs:p-4 xs:py-6 max-w-2xl w-11/12 focus:outline-none" aria-describedby="scheduled-time-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-4 xs:mb-0">{t("recordWorkTime")}</DialogTitle>
        </DialogHeader>
          <p id="scheduled-time-dialog-description" className="sr-only">
            This dialog allows you to record your work and break times.
          </p>
        <div className="space-y-5 max-h-[70vh] overflow-y-auto px-2">
          <DateTimeInputGroup
            label={t("workStart")}
            dateValue={workStart.date}
            timeValue={workStart.time}
            onDateChange={(e) => handleWorkDateTimeChange('start', 'date', e.target.value)}
            onTimeChange={(e) => handleWorkDateTimeChange('start', 'time', e.target.value)}
          />
          <DateTimeInputGroup
            label={t("workEnd")}
            dateValue={workEnd.date}
            timeValue={workEnd.time}
            onDateChange={(e) => handleWorkDateTimeChange('end', 'date', e.target.value)}
            onTimeChange={(e) => handleWorkDateTimeChange('end', 'time', e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium ml-0.5">{t("workMemo")}</label>
            <Textarea
              value={workMemo}
              onChange={(e) => setWorkMemo(e.target.value)}
              placeholder={t("enterWorkMemo")}
              className="w-full focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline outline-[1.5px] outline-gray-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("breakTime")}</label>
            {breaks.length === 0 ? (
              <div className="text-sm text-gray-500 text-center">{t("noBreakRegistered")}</div>
            ) : (
              <div className="space-y-3">
                {breaks.map((b, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg relative border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => handleRemoveBreak(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-3">
                      <DateTimeInputGroup
                        label={t("breakStart", {index: index + 1})}
                        dateValue={b.start.date}
                        timeValue={b.start.time}
                        onDateChange={(e) => handleBreakDateTimeChange(index, 'start', 'date', e.target.value)}
                        onTimeChange={(e) => handleBreakDateTimeChange(index, 'start', 'time', e.target.value)}
                      />
                      <DateTimeInputGroup
                        label={t("breakEnd", {index: index + 1})}
                        dateValue={b.end.date}
                        timeValue={b.end.time}
                        onDateChange={(e) => handleBreakDateTimeChange(index, 'end', 'date', e.target.value)}
                        onTimeChange={(e) => handleBreakDateTimeChange(index, 'end', 'time', e.target.value)}
                      />
                      <div className="space-y-1">
                      <label className="text-sm font-medium ml-0.5">{t("breakMemo", {index: index + 1})}</label>
                        <Textarea
                          value={b.memo}
                          onChange={(e) => {
                            const updatedBreaks = [...breaks];
                            updatedBreaks[index].memo = e.target.value;
                            setBreaks(updatedBreaks);
                          }}
                          placeholder={t("enterBreakMemo", {index: index + 1})}
                          rows={2}
                          className="w-full focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline outline-[1.5px] outline-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center pt-2">
              <Button variant="outline" className="text-sm" onClick={handleAddBreak}>
                <Plus className="mr-2 h-4 w-4" />
                {t("addBreak")}
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center py-6 rounded-lg shadow-md text-base"
            onClick={handleScheduledClockIn}
          >
            <CalendarPlus className="h-5 w-5 mr-1" />
            {t("saveRecord")}
          </Button>
        
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledTimeDialog;