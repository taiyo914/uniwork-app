"use client"
import { useState, useEffect } from "react";
import useAttendanceStore from "@/stores/useAttendanceStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, PlayCircle, StopCircle } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useTranslation } from 'react-i18next';


const CurrentTimeButtons = () => {
  const { t:translate } = useTranslation();
  const t = (key: string) => translate(`timelog.currentTimeButtons.${key}`);
  const { workStatus, setWorkStatus, setRecords, addRecord, records , totalBreakTime, setTotalBreakTime} = useAttendanceStore();

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

  useEffect(() => {
    if (records.length > 0) {
      const currentRecord = records[0];
      if (workStatus === "working" && currentRecord.work_start) {
        const start = new Date(currentRecord.work_start).getTime();
        const elapsedWorkTime = Math.floor((Date.now() - start) / 1000);
        setWorkTime(elapsedWorkTime - totalBreakTime);
        setBreakTime(0); 
      }
      if (workStatus === "onBreak" && currentRecord.work_start) {
        const start = new Date(currentRecord.work_start).getTime();
        const elapsedWorkTime = Math.floor((Date.now() - start) / 1000);
        setWorkTime(elapsedWorkTime - totalBreakTime);
        const lastBreak = currentRecord.break_logs[currentRecord.break_logs.length - 1];
        console.log(currentRecord, lastBreak)
        if (lastBreak.break_start) {
          const breakStart = new Date(lastBreak.break_start).getTime();
          setBreakTime(Math.floor((Date.now() - breakStart) / 1000));
        }
      }
    }
  }, [records, workStatus, totalBreakTime]);

  const updateWorkStatus = async (userId: string, status: "working" | "notStarted" | "onBreak") => {
    const { error } = await supabase
      .from("profiles")
      .update({ work_status: status })
      .eq("user_id", userId);
  
    if (error) {
      console.error(`Failed to update work_status to ${status} (CurrentButton/updateWorkStatus):`, error.message);
      return false;  
    }

    return true; 
  };

  const handleTimeRecord = async (action: string) => {
    const now = new Date().toISOString();
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error("Failed to get user (CurrentTimeButtons/handleTimeRecord)");
      return;
    }

    const currentRecord = records[0];

    if (action === "startWork") {
      const { data: newRecord, error } = await supabase
        .from("attendance_logs")
        .insert(
          {
            user_id: user.id,
            work_start: now,
          },
        )
        .select('*, break_logs(*)')
        .single()

      if (error) {
        console.error("Failed to insert new record (CurrentTimeButtons/handleTimeRecord/startWork):", error.message);
        return;
      }

      addRecord(newRecord); 
      setWorkStatus("working");
      setWorkTime(0); 
      setTotalBreakTime(0); 

      if (!(await updateWorkStatus(user.id, "working"))) return;

    } else if (action === "endWork" && currentRecord) {

      const { error } = await supabase
        .from("attendance_logs")
        .update({ work_end: now })
        .eq("id", currentRecord.id)

      if (error) {
        console.error("Failed to update record (CurrentTimeButtons/handleTimeRecord/endWork):", error.message);
        return;
      }

      const updatedRecord = { ...currentRecord, work_end: now };
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      setRecords(updatedRecords);
      setWorkStatus("notStarted");
      setWorkTime(0); 
      setBreakTime(0);
      setTotalBreakTime(0);

      if (!(await updateWorkStatus(user.id, "notStarted"))) return;

    } else if (action === "startBreak" && currentRecord) {

      const { data: newBreak, error } = await supabase
        .from("break_logs")
        .insert([
          {
            attendance_log_id: currentRecord.id,
            break_start: now,
          },
        ])
        .select()
        .single();

        if (error) {
          console.error("Failed to insert record (CurrentTimeButtons/handleTimeRecord/startBreak):", error.message);
          return;
        }

      const updatedRecord = {
        ...currentRecord,
        break_logs: [...(currentRecord.break_logs || []), newBreak],
      };
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      setRecords(updatedRecords); // records全体を更新
      setWorkStatus("onBreak");
      setBreakTime(0);

      if (!(await updateWorkStatus(user.id, "onBreak"))) return;
      
    } else if (action === "endBreak" && currentRecord) {
      const lastBreakIndex = currentRecord.break_logs.length - 1;
      const lastBreak = currentRecord.break_logs[lastBreakIndex];
      if (!lastBreak || lastBreak.break_end) return;

      const { error } = await supabase
        .from("break_logs")
        .update({ break_end: now })
        .eq("id", lastBreak.id)

      if (error) {
        console.error("Failed to update record (CurrentTimeButtons/handleTimeRecord/endBreak):", error.message);
        return;
      }

      const updatedBreakLogs = [
        ...currentRecord.break_logs.slice(0, lastBreakIndex),
        { ...lastBreak, break_end: now }
      ];
    

      let calculatedTotalBreakTime = 0;
      calculatedTotalBreakTime = updatedBreakLogs.reduce((acc, log) => {
        if (log.break_start) {
          const breakStart = new Date(log.break_start).getTime();
          const breakEnd = log.break_end ? new Date(log.break_end).getTime() : Date.now();
          return acc + Math.floor((breakEnd - breakStart) / 1000); // 秒単位で加算
        }
        return acc;
      }, 0);

      setTotalBreakTime(calculatedTotalBreakTime); 
      setBreakTime(0);

      const updatedRecord = { ...currentRecord, break_logs: updatedBreakLogs };
      setRecords([updatedRecord, ...records.slice(1)]);
      setWorkStatus("working");

      if (!(await updateWorkStatus(user.id, "working"))) return;
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
    if (workStatus === "working") return t("working") 
    if (workStatus === "onBreak") return t("onBreak")
    if (workStatus === "notStarted") return t("notStarted")
  }

  const getMainButtonStyle = () => {
    const baseStyle = "w-full h-16 sm:h-20 text-xl font-semibold transition-all duration-300";
    if (workStatus === "working") return `${baseStyle} bg-green-200 hover:bg-green-300 text-green-800 border border-green-300 shadow`;
    if (workStatus === "onBreak") return `${baseStyle} bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed`;
    if (workStatus === "notStarted") return `${baseStyle} bg-blue-200 hover:bg-blue-300 border border-blue-300 text-blue-700 shadow`;
  };

  return (
    <>
    <div className="max-w-2xl mx-auto">
      <Card className={`shadow border-0 border-t-4 ${getBorderColor()}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-center mt-3 lg:mt-4 text-gray-900">{t("currentWorkTime")}</CardTitle> 
        </CardHeader>
        <CardContent className="space-y-6 lg:space-y-7  px-5 pb-5 sm:pb-7 sm:px-7">
          <div className="text-center">
            <p className={`sm:text-6xl text-5xl font-bold  font-sans lg:tracking-wide transition-colors 
              ${workStatus === "onBreak" ? "text-gray-300 duration-200" : "text-black"}
            `} >
              {formatTime(workTime)}
            </p>
            <div className="mt-[1.15rem] lg:mt-5">
              <Badge className={`${getBadgeStyle()} transition-all`}>{getBadgeLabel()}</Badge>
            </div>
          </div>

          <Button
            onClick={() => handleTimeRecord(workStatus === "notStarted" ? "startWork" : "endWork")}
            className={getMainButtonStyle()}
            disabled={workStatus === "onBreak"}
          >
            {workStatus === "notStarted" ? <LogIn /> : <LogOut />} 
            {workStatus === "notStarted" ? t("startWork") : t("endWork")}
          </Button>

          {(workStatus === "working" || workStatus === "onBreak") && (
            <div className={` border rounded-lg p-4 w-full text-center
              ${workStatus === "onBreak" ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-300"}
            `}>
              <p className="text-lg font-semibold text-gray-700 mb-1">{t("breakTime")}</p>
              <p className={`text-3xl font-bold  font-sans tracking-wide transition-colors mb-3
                ${workStatus === "onBreak" ? "text-gray-800" : "text-gray-500"}
              `} >
                {formatTime(breakTime)}
              </p>
              <Button
                onClick={() => handleTimeRecord(workStatus === "onBreak" ? "endBreak" : "startBreak")}
                className={`w-1/3 h-12 text-base font-semibold mx-auto shadow min-w-fit
                  ${workStatus === "onBreak" 
                    ? "bg-orange-200 text-orange-800 border border-orange-300 hover:bg-orange-300" 
                    : "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200"
                  }
                `}
              >
                {workStatus === "onBreak" ? <StopCircle className="w-5 h-5 mr-0"/> : <PlayCircle className="w-5 h-5 mr-0"/>} 
                {workStatus === "onBreak" ? t("endBreak") : t("startBreak")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </>
  );
};

export default CurrentTimeButtons;
