"use client"
import CurrentTimeButtons from "./CurrentTimeButtons"
import ScheduledTimeDialog from "./ScheduledTimeDialog"
import AttendanceHistory from "./AttendanceHistory"
import useAttendanceStore from "@/stores/useAttendanceStore";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Timelog() {
  const { t } = useTranslation();
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
    <div className="px-4 sm:px-5 md:px-6 xl:px-7" >
      <div className="max-w-[1350px] mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold py-5 sm:py-6 lg:py-5 text-blue-700 text-center lg:text-left">
          {t("timelog.headerTitle")}
        </h1>
        <div className=" mx-auto w-full">
          {loading
            ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin text-blue-200" size={50}/>
              </div>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row lg:justify-end items-center lg:items-start  space-y-4 sm:space-y-5 lg:space-y-0 lg:space-x-6 xl:space-x-7">
                  <div className="sm:space-y-5 space-y-4 lg:space-y-6 w-full lg:flex-1 lg:max-w-[550px] max-w-[650px]">
                    <CurrentTimeButtons />
                    {workStatus === "notStarted" && <ScheduledTimeDialog />}
                  </div>
                  <div className="w-full lg:flex-1 lg:max-w-full max-w-[650px]">
                    <AttendanceHistory />
                  </div>
                </div>
              </>
            )
          }
        </div>
        
      </div>
    </div>
  )
}