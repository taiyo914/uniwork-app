import React from 'react';
import { Info, StickyNote } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AttendanceLog } from '../employee';
import { format } from 'date-fns';

interface TimestampsTabProps {
  timeStamps: AttendanceLog[];
}

export const TimestampsTab: React.FC<TimestampsTabProps> = ({ timeStamps }) => {
  const calculateTotalBreakTime = (breakLogs: AttendanceLog['break_logs']): number => {
    return breakLogs.reduce((total, breakLog) => {
      const start = new Date(breakLog.break_start);
      const end = new Date(breakLog.break_end);
      return total + (end.getTime() - start.getTime()) / 60000;
    }, 0);
  };

  const calculateWorkingTime = (workStart: Date, workEnd: Date, breakMinutes: number): string => {
    const totalMinutes = (workEnd.getTime() - workStart.getTime()) / 60000 - breakMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">打刻履歴</h3>
      <div className="overflow-x-auto">
        <div className="">
          <Table className="overflow-hidden rounded-t-md font-sans">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold ">日付</TableHead>
                <TableHead className="font-semibold ">出勤</TableHead>
                <TableHead className="font-semibold ">退勤</TableHead>
                <TableHead className="font-semibold ">休憩</TableHead>
                <TableHead className="font-semibold ">実働</TableHead>
                <TableHead className="font-semibold text-nowrap">メモ</TableHead>
                <TableHead className="font-semibold pl-7">承認</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeStamps.map((stamp, index) => {
                const breakMinutes = calculateTotalBreakTime(stamp.break_logs);
                const workingTime = calculateWorkingTime(new Date(stamp.work_start), new Date(stamp.work_end), breakMinutes);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-semibold">{format(new Date(stamp.work_start), 'yy/MM/dd')}</TableCell>
                    <TableCell>{format(new Date(stamp.work_start), 'HH:mm')}</TableCell>
                    <TableCell>{format(new Date(stamp.work_end), 'HH:mm')}</TableCell>
                    <TableCell>
                      {stamp.memo && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <StickyNote className="h-4 w-4 cursor-pointer text-gray-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{stamp.memo}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>{workingTime}</TableCell>
                    <TableCell>
                      {stamp.break_logs.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>{calculateTotalBreakTime(stamp.break_logs)}</span>
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent className="w-fit">
                                <div className="space-y-2">
                                  {stamp.break_logs.map((breakLog, breakIndex) => (
                                    <div key={breakIndex}>
                                      <p className="text-sm font-medium">
                                        {format(new Date(breakLog.break_start), 'HH:mm')} - {format(new Date(breakLog.break_end), 'HH:mm')}
                                      </p>
                                      <p className="text-xs text-gray-500">{breakLog.memo}</p>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="">
                      {stamp.approved ? (
                        <span className="text-gray-600">承認済み</span>
                      ) : (
                        <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 border-blue-100 font-semibold">
                          承認
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};