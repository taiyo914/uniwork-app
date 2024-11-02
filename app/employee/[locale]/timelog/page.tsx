"use client"
import CurrentTimeButtons from "./CurrentTimeButtons"
import ScheduledTimeDialog from "./ScheduledTimeDialog"
import AttendanceHistory from "./AttendanceHistory"
import useAttendanceStore from "@/stores/useAttendanceStore";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader, Loader2 } from "lucide-react";

export default function Timelog() {
  const { loadInitialData, workStatus } = useAttendanceStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadInitialData(user.id)
        setLoading(false)
      }
    };
    loadUserData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen pb-1 lg:px-3">
      <div className="max-w-[1700px]">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-blue-700 text-center lg:text-left">
          勤務登録画面
        </h1>
        <div className="space-y-5 mx-auto w-full">
          {loading
            ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-blue-200" size={50}/>
              </div>
            ) : (
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-7 gap-y-5">
                  <div className="space-y-5 lg:space-y-7">
                    <CurrentTimeButtons />
                    {workStatus === "notStarted" && <ScheduledTimeDialog />}
                  </div>
                  <AttendanceHistory />
                </div>
            )
          }
        </div>
      </div>
    </div>
  )
}