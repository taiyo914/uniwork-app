import React from 'react';
import { Info, StickyNote } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TimeStamp, BreakTime } from '../employee';
import { format } from 'date-fns';

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
      <h3 className="text-lg font-semibold mb-2">打刻履歴</h3>
      <div className="overflow-x-auto">
        <div className="">
          <Table className="overflow-hidden rounded-t-md font-sans">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold ">日付</TableHead>
                <TableHead className="font-semibold ">出勤</TableHead>
                <TableHead className="font-semibold ">退勤</TableHead>
                <TableHead className="font-semibold text-nowrap">メモ</TableHead>
                <TableHead className="font-semibold ">休憩</TableHead>
                <TableHead className="font-semibold pl-7">承認</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeStamps.map((stamp, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold">{format(new Date(stamp.date), 'yy/MM/dd')}</TableCell>
                  <TableCell>{stamp.checkIn}</TableCell>
                  <TableCell>{stamp.checkOut}</TableCell>
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
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span>{calculateTotalBreakTime(stamp.breakTimes)}</span>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 cursor-pointer" />
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
                  <TableCell className="">
                    {stamp.approved ? (
                      <span className="text-gray-600">承認済み</span>
                    ) : (
                      <Button variant="outline" size="sm" className="bg-gray-50 hover:bg-gray-100 text-gray-800">
                        承認
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};