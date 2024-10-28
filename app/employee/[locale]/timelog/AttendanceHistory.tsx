"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAttendanceStore from "@/stores/useAttendanceStore";

const AttendanceHistory = () => {
  const { records } = useAttendanceStore();

  return (
    <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-2xl text-blue-700">打刻履歴</CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <ScrollArea className="h-[calc(100vh-650px)] min-h-[500px]">
          {records.map((record) => (
            <div key={record.id} className="mb-5 p-4 bg-gray-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-lg text-blue-700">勤務開始: {new Date(record.work_start).toLocaleString()}</p>
              <p className="font-semibold text-lg text-blue-700">勤務終了: {new Date(record.work_end).toLocaleString()}</p>
              <p className="text-sm text-gray-600">メモ: {record.memo}</p>
              <p className="text-sm text-gray-600">承認ステータス: {record.approved ? "承認済み" : "未承認"}</p>
              {/* <p className="text-sm text-gray-600">作成日時: {new Date(record.created_at).toLocaleString()}</p> */}
              {/* <p className="text-sm text-gray-600">更新日時: {new Date(record.updated_at).toLocaleString()}</p> */}

              {record.break_logs.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="font-semibold text-blue-700">休憩履歴:</p>
                  {record.break_logs.map((breakLog) => (
                    <div key={breakLog.id} className="ml-4 mt-2 p-2 bg-white rounded-lg border border-gray-300">
                      <p className="text-sm text-gray-700">休憩開始: {new Date(breakLog.break_start).toLocaleString()}</p>
                      <p className="text-sm text-gray-700">休憩終了: {new Date(breakLog.break_end).toLocaleString()}</p>
                      {/* <p className="text-sm text-gray-600">メモ: {breakLog.memo}</p> */}
                      {/* <p className="text-sm text-gray-600">手動入力: {breakLog.manual_entry ? "はい" : "いいえ"}</p> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;
