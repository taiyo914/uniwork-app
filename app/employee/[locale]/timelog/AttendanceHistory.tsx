"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Timer, StickyNote, PenSquare, History, Coffee } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import useAttendanceStore from "@/stores/useAttendanceStore"
import { format, parseISO, differenceInMinutes, isSameDay, addDays } from "date-fns"
import { ja, enUS, it, ru } from "date-fns/locale";
import { useState } from "react"
import { AttendanceRecord, BreakLog } from "@/stores/useAttendanceStore"
import { supabase } from "@/utils/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Component() {
  const { records, setRecords } = useAttendanceStore()
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = a.work_start ? new Date(a.work_start).getTime() : 0;
    const dateB = b.work_start ? new Date(b.work_start).getTime() : 0;
    return dateB - dateA; 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null >(null);
  const [selectedBreakLog, setSelectedBreakLog] = useState<BreakLog | null>(null);
  const [newMemo, setNewMemo] = useState("");

  const openMemoDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setNewMemo(record.memo);
    setIsDialogOpen(true);
  };

  const openBreakMemoDialog = (record: AttendanceRecord, breakLog: BreakLog) => {
    setSelectedRecord(record);
    setSelectedBreakLog(breakLog);
    setNewMemo(breakLog.memo);
    setIsBreakDialogOpen(true);
  };

  const handleMemoSave = async () => {
    if (!selectedRecord) return;

    const { error } = await supabase
      .from("attendance_logs")
      .update({ memo: newMemo })
      .eq("id", selectedRecord.id);
  
    if (error) {
      console.error("Failed to update memo (AttendanceHistory/handleMemoSave):", error.message);
      return;
    }
  
    const updatedRecords = records.map((record) =>
      record.id === selectedRecord.id ? { ...record, memo: newMemo } : record
    );
    setRecords(updatedRecords);
  
    setIsDialogOpen(false);
  };

  const handleBreakMemoSave = async () => {
    if (!selectedBreakLog || !selectedRecord) return;

    const { error } = await supabase
      .from("break_logs")
      .update({ memo: newMemo })
      .eq("id", selectedBreakLog.id);

    if (error) {
      console.error("Failed to update break log memo:(AttendanceHistory/handleBreakMemoSave)", error.message);
      return;
    }

    const updatedRecords = records.map((record) => {
      if (record.id === selectedRecord.id) {
        const updatedBreakLogs = record.break_logs.map((log) =>
          log.id === selectedBreakLog.id ? { ...log, memo: newMemo } : log
        );
        return { ...record, break_logs: updatedBreakLogs };
      }
      return record;
    });

    setRecords(updatedRecords);
    setIsBreakDialogOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    return format(date, "MM/dd");
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    return format(date, "HH:mm");
  };

  const formatTimeWithReferenceDate = (start: string | null, end: string | null, referenceDate: string | null) => {
    if (!start || !referenceDate) return '';
    const startDate = parseISO(start);
    const startTime = formatTime(start);
    const startSupplementary = !isSameDay(parseISO(referenceDate), startDate) && (
      <span className="text-[80%] text-muted-foreground/60 ml-[0.2rem] inline-block">{`(${format(startDate, "MM/dd")})`}</span>
    );
  
    if (!end) {
      return (
        <>
          {startTime}{startSupplementary} - 
          <span className="text-[80%] text-muted-foreground/60 ml-[0.2rem] inline-block">{"(現在時刻)"}</span>
        </>
      );
    }
  
    const endDate = parseISO(end);
    const endTime = formatTime(end);
    const endSupplementary = !isSameDay(parseISO(referenceDate), endDate) && (
      <span className="text-[80%] text-muted-foreground/60 ml-[0.2rem] inline-block">{`(${format(endDate, "MM/dd")})`}</span>
    );
  
    return (
      <>
        {startTime}{startSupplementary} - {endTime}{endSupplementary}
      </>
    );
  };

  // 秒まで加味するか
  // const calculateDuration = (start:string| null, end: string| null) => {
  //   if (!start) return '0分';
  //   const startDate = parseISO(start);
  //   const endDate = end ? parseISO(end) : new Date();
  //   const durationInMinutes = differenceInMinutes(endDate, startDate);
  //   const hours = Math.floor(durationInMinutes / 60);
  //   const minutes = durationInMinutes % 60;
  //   return hours ? `${hours}時間${minutes.toString().padStart(1, '0')}分` : `${minutes}分`;
  // };

  // 秒は切り捨てて分だけで考えるか
  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start) return '0分';
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : new Date();
    const startMinutes = Math.floor(startDate.getTime() / 60000);
    const endMinutes = Math.floor(endDate.getTime() / 60000);
    const durationInMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return hours ? `${hours}時間${minutes.toString().padStart(1, '0')}分` : `${minutes}分`;
  };

  const calculateActualWorkDuration = (record: AttendanceRecord) => {
    const { work_start, work_end, break_logs } = record;
  
    if (!work_start) return '0分';
    if (!work_end) return <span>{'計算中'}</span>;
  
    const startDate = parseISO(work_start);
    const endDate = work_end ? parseISO(work_end) : new Date();
  
    // 勤務時間全体の分数
    const totalWorkMinutes = Math.floor(endDate.getTime() / 60000) - Math.floor(startDate.getTime() / 60000);
  
    // 休憩時間の分数合計
    const totalBreakMinutes = break_logs.reduce((total, breakLog) => {
      if (breakLog.break_start && breakLog.break_end) {
        const breakStart = Math.floor(parseISO(breakLog.break_start).getTime() / 60000);
        const breakEnd = Math.floor(parseISO(breakLog.break_end).getTime() / 60000);
        return total + (breakEnd - breakStart);
      }
      return total;
    }, 0);
  
    // 実働時間の分数
    const actualWorkMinutes = totalWorkMinutes - totalBreakMinutes;
    const hours = Math.floor(actualWorkMinutes / 60);
    const minutes = actualWorkMinutes % 60;
  
    return hours ? `${hours}時間${minutes.toString().padStart(1, '0')}分` : `${minutes}分`;
  };
  

  return (<>
    <Card className="bg-white shadow-lg rounded-xl overflow-hidden font-sans max-w-3xl mx-auto w-full">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-2xl text-blue-800 flex items-center gap-2">打刻履歴<History className="h-6 w-6"/></CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="min-h-[500px] h-[calc(100vh-700px)] xl:h-[calc(100vh-250px)] w-full rounded-md pt-5  px-2">
          <div className="space-y-4 py-3">
            {sortedRecords.map((record) => (
              <Card key={record.id} className="w-full">
                <CardHeader className="flex-row items-center justify-between border-b bg-slate-50/50 py-3 pl-[1.15rem] pr-4">
                  <div className="flex items-baseline ">
                    <div className="text-2xl font-bold">{formatDate(record.work_start)}</div>
                    <div className="text-muted-foreground mx-2">
                      {record.work_start ? `(${format(parseISO(record.work_start), 'EEE', { locale: ja })})` : ''}
                    </div>
                    <div className="text-muted-foreground -ml-0.5">
                      {record.work_start ? format(parseISO(record.work_start), 'yyyy') : ''}
                    </div>
                  </div>
                  <div>
                    <Badge className={`border py-1 mb-1 ${
                      record.work_end
                        ? record.approved
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : " bg-green-100 text-green-800 border-green-300"
                    }`}>
                      {record.work_end ? (record.approved ? "承認済み" : "未承認") : "勤務中"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 py-5">
                  
                  {/* 勤務時間 */}
                  <div className="flex items-center gap-1 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground "/>
                    <div className="text-muted-foreground ">
                      勤務時間 : 
                    </div>
                    <div className="text-xl font-semibold">
                      {formatTimeWithReferenceDate(record.work_start, record.work_end, record.work_start)}
                    </div>
                  </div>

                  {/* 実働時間 */}
                  <div className="flex items-center gap-1 mb-3">
                    <Timer className=" h-5 w-5 -mx-[2px] mb-0.5 text-muted-foreground "/>
                    <div className="text-muted-foreground ">
                      実働時間 : 
                    </div>
                    <div className="text-xl font-semibold ">
                      {calculateActualWorkDuration(record)}
                    </div>
                  </div>

                  {/* メモ */}
                  <div className="flex items-center gap-1 mb-3">
                    <StickyNote className=" h-4 w-4 text-muted-foreground "/>
                    <div className="text-muted-foreground ">
                      メモ : 
                    </div>
                    <div className="">
                      {record.memo}
                      <PenSquare className="h-[1.15rem] w-[1.15rem] inline mb-0.5 ml-1 text-blue-500 hover:text-blue-700 hover:cursor-pointer" onClick={() => openMemoDialog(record)}/>
                    </div>
                  </div>

                  {record.break_logs && record.break_logs.length > 0 && (
                    <div className="space-y-2 mt-0.5">
                      <h3 className="text-muted-foreground flex items-center gap-1"><Coffee className="h-4 w-4 "/>休憩履歴 : </h3>
                      <div className="space-y-3 pl-1">
                        {record.break_logs.map((breakLog) => (
                          <div key={breakLog.id} className="rounded-lg border px-4 py-3">
                            <div className="grid gap-1.5">
                              <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold">
                                  <Clock className="inline mb-[0.17rem] h-4 w-4 mr-1"/>
                                  {formatTimeWithReferenceDate(breakLog.break_start, breakLog.break_end, record.work_start)}
                                </p>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
                                  {calculateDuration(breakLog.break_start, breakLog.break_end)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1 ">
                                <StickyNote className=" h-4 w-4 text-muted-foreground "/>
                                <div className="text-muted-foreground ">
                                  メモ : 
                                </div>
                                <div className="">
                                  {breakLog.memo}
                                  <PenSquare className="h-[1.15rem] w-[1.15rem] inline mb-0.5 mx-1 text-blue-500 hover:text-blue-700 hover:cursor-pointer"  onClick={() => openBreakMemoDialog(record, breakLog)}/>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    {selectedRecord && (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-auto p-4">
          <DialogHeader>
            <DialogTitle>勤務メモを編集</DialogTitle>
          </DialogHeader>
          <Textarea
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="勤務メモを入力してください"
            className="w-full mt-4 mb-2 border-gray-300 rounded-md"
          />
          <Button className="w-full mt-2 bg-blue-500 text-white" onClick={handleMemoSave}>
            保存する
          </Button>
        </DialogContent>
      </Dialog>
    )}

    {selectedBreakLog && (
      <Dialog open={isBreakDialogOpen} onOpenChange={setIsBreakDialogOpen}>
        <DialogContent className="max-w-md mx-auto p-4">
          <DialogHeader>
            <DialogTitle>休憩メモを編集</DialogTitle>
          </DialogHeader>
          <Textarea
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="休憩メモを入力してください"
            className="w-full mt-4 mb-2 border-gray-300 rounded-md"
          />
          <Button className="w-full mt-2 bg-blue-500 text-white" onClick={handleBreakMemoSave}>
            保存する
          </Button>
        </DialogContent>
      </Dialog>
    )}
   </>);
}
