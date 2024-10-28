import CurrentTimeButtons from "./CurrentTimeButtons"
import ScheduledTimeDialog from "./ScheduledTimeDialog"
import AttendanceHistory from "./AttendanceHistory"

export default function Timelog() {

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto w-full ">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-center text-blue-700">
          勤務時間登録
        </h1>
        <div className="space-y-5">
          <CurrentTimeButtons />
          <ScheduledTimeDialog />
          <AttendanceHistory />
        </div>
      </div>
    </div>
  )
}