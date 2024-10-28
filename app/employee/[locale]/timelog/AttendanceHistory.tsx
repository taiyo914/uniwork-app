"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAttendanceStore from "@/stores/useAttendanceStore";

const AttendanceHistory = () => {
  const { records } = useAttendanceStore();

  return (
    <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-100">
        <CardTitle className="text-2xl  text-blue-700">打刻履歴</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[calc(100vh-650px)] min-h-[500px]">
          {records.map((record, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-blue-200 ">
              <p className="font-semibold text-lg text-blue-700">{record.action}</p>
              <p className="text-sm text-gray-600">{record.date} {record.time}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AttendanceHistory;
