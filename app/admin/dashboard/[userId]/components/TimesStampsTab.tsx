import React from 'react';
import { Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TimeStamp, BreakTime } from '@/types/employee';

interface TimestampsTabProps {
  timeStamps: TimeStamp[];
}

export const TimestampsTab: React.FC<TimestampsTabProps> = ({ timeStamps }) => {
  const calculateTotalBreakTime = (breakTimes: BreakTime[]): string => {
    const totalMinutes = breakTimes.reduce((total, breakTime) => {
      const start = new Date(`2000-01-01T${breakTime.start}`);
      const end = new Date(`2000-01-01T${breakTime.end}`);
      return total + (end.getTime() - start.getTime()) / 60000;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">タイムスタンプ履歴</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">日付</TableHead>
            <TableHead className="font-semibold">出勤時間</TableHead>
            <TableHead className="font-semibold">退勤時間</TableHead>
            <TableHead className="font-semibold">休憩</TableHead>
            <TableHead className="font-semibold">メモ</TableHead>
            <TableHead className="font-semibold">承認</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeStamps.map((stamp, index) => (
            <TableRow key={index}>
              <TableCell>{stamp.date}</TableCell>
              <TableCell>{stamp.checkIn}</TableCell>
              <TableCell>{stamp.checkOut}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{calculateTotalBreakTime(stamp.breakTimes)}</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">休憩詳細</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="w-64">
                        <div className="space-y-2">
                          {stamp.breakTimes.map((breakTime, breakIndex) => (
                            <div key={breakIndex}>
                              <p className="text-sm font-medium">{breakTime.start} - {breakTime.end}</p>
                              <p className="text-xs text-gray-500">{breakTime.memo}</p>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell>{stamp.memo}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="bg-gray-50 hover:bg-gray-100 text-gray-800">
                  {stamp.approved ? "承認済み" : "承認"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};