"use client"
import CurrentTimeButtons from "./CurrentTimeButtons"
import ScheduledTimeDialog from "./ScheduledTimeDialog"
import AttendanceHistory from "./AttendanceHistory"
import useAttendanceStore from "@/stores/useAttendanceStore";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader, Loader2 } from "lucide-react";


export default function Timelog() {
  const { loadInitialData } = useAttendanceStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadInitialData(user.id); //await効果あります
      setLoading(false)
    };
    loadUserData();
  }, [setLoading, loadInitialData]);

  return (
    <div className="min-h-screen pb-1">
      <div className="max-w-3xl mx-auto w-full ">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-center text-blue-700">
          勤務登録画面
        </h1>
        <div className="space-y-5">
          {loading
            ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-blue-200" size={50}/>
              </div>
            ) : (
              <>
                <CurrentTimeButtons />
                <ScheduledTimeDialog />
                <AttendanceHistory />
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}