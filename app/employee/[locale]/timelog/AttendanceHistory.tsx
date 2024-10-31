"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, PenSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useAttendanceStore from "@/stores/useAttendanceStore"
import { format, parseISO, differenceInMinutes, isSameDay } from "date-fns"
import { enUS, it, ru, ja } from "date-fns/locale";

export default function Component() {
  const { records } = useAttendanceStore()

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = parseISO(dateString)
    return format(date, "MM/dd")
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = parseISO(dateString)
    return format(date, "HH:mm")
  }

  const calculateDuration = (start: string, end: string) => {
    if (!end) return '進行中';
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    const durationInMinutes = differenceInMinutes(endDate, startDate)
    const hours = Math.floor(durationInMinutes / 60)
    const minutes = durationInMinutes % 60
    if (hours === 0) {
      return `${minutes}分`;
    }
    return `${hours}時間 ${minutes.toString().padStart(2, '0')}分`
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl overflow-hidden font-sans">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-2xl text-blue-800">打刻履歴</CardTitle>
      </CardHeader>
      <CardContent className="">
        <ScrollArea className="min-h-[500px] h-[calc(100vh-660px)] w-full rounded-md py-4">
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="w-full">
                <CardHeader className="flex-row items-start justify-between border-b bg-slate-50/50 py-4">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-bold">{formatDate(record.work_start)}</h2>
                    <span className="text-muted-foreground">({format(parseISO(record.work_start), "EEE" )})</span>
                    <span className="text-sm text-muted-foreground">{format(parseISO(record.work_start), "yyyy")}</span>
                  </div>
                  <Badge variant="secondary" className={record.approved ? "bg-green-100 text-green-800 border border-green-300 py-1" : "bg-yellow-100 text-yellow-800 border border-yellow-300 py-1"}>
                    {record.approved ? "承認済み" : "未承認"}
                  </Badge>
                </CardHeader>
                <CardContent className="grid gap-3 p-4">
                  <div className="grid gap-3 sm:grid-cols-2 px-1">
                    {/* 勤務時間ブロック */}
                    <div className="">
                      <h3 className="text-muted-foreground">勤務時間</h3>
                      <p className="text-lg font-semibold">
                        {formatTime(record.work_start)} - {formatTime(record.work_end)}
                        { record.work_end && !isSameDay(parseISO(record.work_start), parseISO(record.work_end)) && (
                          <span className="text-sm text-muted-foreground font-normal ">
                            （翌日） 
                          </span>
                        )}
                      </p>
                    </div>

                    {/* 合計時間ブロック */}
                    <div className="">
                      <h3 className=" text-muted-foreground">合計時間</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {calculateDuration(record.work_start, record.work_end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* メモブロック */}
                  <div className="rounded-lg border px-3 py-2">
                    <p className="text-muted-foreground ">メモ
                      <PenSquare className="h-4 w-4 inline mb-0.5 mx-1 text-blue-500 hover:text-blue-600 hover:cursor-pointer" />
                      : <span className="text-foreground">{record.memo}</span>
                    </p>
                  </div>

                  {/* 休憩履歴 */}
                  <div className="space-y-2 mt-1">
                    <h3 className="text-muted-foreground pl-1">休憩履歴</h3>
                    <div className="space-y-3">
                      {record.break_logs.map((breakLog) => (
                        <div key={breakLog.id} className="rounded-lg border px-4 py-3">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold">
                                {formatTime(breakLog.break_start)} - {formatTime(breakLog.break_end)}
                              </p>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
                                {calculateDuration(breakLog.break_start, breakLog.break_end)}
                              </span>
                            </div>
                            <div className="">
                              <p className="text-muted-foreground ">メモ
                                <PenSquare className="h-4 w-4 inline mb-0.5 mx-1 text-blue-500 hover:text-blue-600 hover:cursor-pointer" />
                                : <span className="text-foreground">{breakLog.memo}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
