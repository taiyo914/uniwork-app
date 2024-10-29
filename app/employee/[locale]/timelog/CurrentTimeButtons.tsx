"use client"
import { useState, useEffect } from "react";
import useAttendanceStore from "@/stores/useAttendanceStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, PlayCircle, StopCircle, Clock, Coffee } from "lucide-react";

const CurrentTimeButtons = () => {
  const { workStatus, setWorkStatus, setRecords, addRecord, records } = useAttendanceStore();

  const [workTime, setWorkTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (workStatus === "working") {
      interval = setInterval(() => setWorkTime((prevTime) => prevTime + 1), 1000);
    } else if (workStatus === "onBreak") {
      interval = setInterval(() => setBreakTime((prevTime) => prevTime + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workStatus]);

  const handleTimeRecord = (action: string) => {
    const now = new Date();
    const formattedTime = now.toISOString();

    const currentRecord = records[0];
  
    if (action === "勤務開始") {
      const newRecord = {
        id: records.length + 1, // 仮のID
        user_id: 1, // 仮のユーザーID
        work_start: formattedTime,
        work_end: "",
        manual_entry: false,
        memo: "",
        approved: false,
        created_at: formattedTime,
        updated_at: formattedTime,
        break_logs: [],
      };
      addRecord(newRecord); // 新しいレコードをリストの先頭に追加
      setWorkStatus("working");
    } else if (action === "勤務終了" && currentRecord) {
      const updatedRecord = {
        ...currentRecord,
        work_end: formattedTime,
        updated_at: formattedTime,
      };
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      setRecords(updatedRecords);
      setWorkStatus("notStarted");
    } else if (action === "休憩開始" && currentRecord) {
      const newBreakLog = {
        id: currentRecord.break_logs.length + 1, // 仮のID
        break_start: formattedTime,
        break_end: "",
        manual_entry: false,
        memo: "休憩開始",
        created_at: formattedTime,
        updated_at: formattedTime,
      };
      const updatedRecord = {
        ...currentRecord,
        break_logs: [...currentRecord.break_logs, newBreakLog],
        updated_at: formattedTime,
      };
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      setRecords(updatedRecords); // records全体を更新
      setWorkStatus("onBreak");
    } else if (action === "休憩終了" && currentRecord) {
      const updatedBreakLogs = [...currentRecord.break_logs];
      const lastBreak = updatedBreakLogs[updatedBreakLogs.length - 1];
      if (lastBreak && !lastBreak.break_end) {
        lastBreak.break_end = formattedTime;
        lastBreak.updated_at = formattedTime; // 休憩終了時の updated_at を設定
      }
      const updatedRecord = {
        ...currentRecord,
        break_logs: updatedBreakLogs,
        updated_at: formattedTime,
      };
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      setRecords(updatedRecords);
      setWorkStatus("working");
    }
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getBorderColor = () => {
    if (workStatus === "working") return "border-green-400";
    if (workStatus === "onBreak") return "border-yellow-500";
    if (workStatus === "notStarted")return "border-blue-400";
  };

  const getBadgeStyle = () => {
    if (workStatus === "working") return "bg-green-500 text-white px-3 py-1 text-sm"
    if (workStatus === "onBreak") return "bg-yellow-500 text-white px-3 py-1 text-sm"
    if (workStatus === "notStarted") return "bg-blue-500 text-white px-3 py-1 text-sm"
  }

  const getBadgeLabel = () =>{
    if (workStatus === "working") return "勤務中"
    if (workStatus === "onBreak") return "休憩中"
    if (workStatus === "notStarted") return "勤務外"
  }

  const getMainButtonStyle = () => {
    const baseStyle = "w-full h-20 text-xl font-semibold transition-all duration-300";
    if (workStatus === "working") return `${baseStyle} bg-green-200 hover:bg-green-300 text-green-800 border border-green-300 shadow-sm`;
    if (workStatus === "onBreak") return `${baseStyle} bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed`;
    if (workStatus === "notStarted") return `${baseStyle} bg-blue-200 hover:bg-blue-300 border border-blue-300 text-blue-700 shadow-sm`;
  };

  return (
    <div >
    <div className="max-w-4xl mx-auto">
      <Card className={`border-0 border-t-4 ${getBorderColor()}`}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">勤務時間管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">現在の勤務時間</p>
            <p className={`text-6xl font-bold  font-sans tracking-wide transition-colors 
              ${workStatus === "onBreak" ? "text-gray-300 duration-200" : "text-black"}
            `} >
              {formatTime(workTime)}
            </p>
            <div className="mt-2">
              <Badge className={`${getBadgeStyle()} transition-all`}>{getBadgeLabel()}</Badge>
            </div>
          </div>

          <Button
            onClick={() => handleTimeRecord(workStatus === "notStarted" ? "勤務開始" : "勤務終了")}
            className={getMainButtonStyle()}
            disabled={workStatus === "onBreak"}
          >
            {workStatus === "notStarted" ? <LogIn /> : <LogOut />} 
            {workStatus === "notStarted" ? "勤務開始" : "勤務終了"}
          </Button>

          {(workStatus === "working" || workStatus === "onBreak") && (
            <div className={` border rounded-lg p-4 space-y-2 w-full text-center
              ${workStatus === "onBreak" ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-300"}
            `}>
              <p className="text-lg font-semibold text-gray-700">休憩時間</p>
              <p className={`text-2xl font-bold  font-sans tracking-wide transition-colors
                ${workStatus === "onBreak" ? "text-gray-800" : "text-gray-500"}
              `} >
                {formatTime(breakTime)}
              </p>
              <Button
                onClick={() => handleTimeRecord(workStatus === "onBreak" ? "休憩終了" : "休憩開始")}
                className={`w-1/3 h-12 text-base font-semibold mx-auto shadow-sm
                  ${workStatus === "onBreak" 
                    ? "bg-orange-200 text-orange-800 border border-orange-300 hover:bg-orange-300" 
                    : "bg-yellow-100 text-yellow-800 border border-yellow-400 hover:bg-yellow-200"
                  }
                `}
              >
                {workStatus === "onBreak" ? <StopCircle className="w-5 h-5 mr-0"/> : <PlayCircle className="w-5 h-5 mr-0"/>} 
                {workStatus === "onBreak" ? "休憩終了" : "休憩開始"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default CurrentTimeButtons;
