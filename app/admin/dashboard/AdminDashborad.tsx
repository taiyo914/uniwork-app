'use client'

import { useState } from 'react'
import { Users, AlertTriangle, Clock, Coffee } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { residenceStatusTranslation } from '../residenceStatusTranslation'

type WorkStatus = 'working' | 'notStarted' | 'onBreak'

type Employee = {
  user_id: string
  emp_id: number
  english_name: string
  weekly_hours: number //リレーションと計算が必要
  expiration_date: string //実際はDate型
  image_url: string
  residence_status: string
  unapproved_shifts: number //リレーションと計算が必要
  work_status: WorkStatus
  last_work_day: string | null //リレーションで最後の勤務日を取得
  remarks?: string
}

type Props = {
  initialEmployees: Employee[]
}

export default function AdminDashboard({ initialEmployees }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)

  const formatEmpId = (empId: number) => {
    return `EMP${empId.toString().padStart(3, '0')}`
  }

  const getWorkStatusBadge = (status: WorkStatus) => {
    switch (status) {
      case 'working':
        return <Badge className="text-xs border-green-300 bg-green-100 text-green-800 px-3 py-1"> 勤務中</Badge>
      case 'onBreak':
        return <Badge className="text-xs border-yellow-300 bg-yellow-100 text-yellow-800 px-3 py-1"> 休憩中</Badge>
      case 'notStarted':  
        return <Badge className="text-xs border-blue-300 bg-blue-100 text-blue-800 px-3 py-1">勤務外</Badge>
    }
  }

  return (
    <div className="w-full h-screen max-w-[2000px]">

      <div className="h-4"></div>

      <div className="flex items-center text-xl font-semibold ml-5 sm:ml-6">
        <Users className="mr-2 h-5 w-5" />
        従業員一覧
      </div>

      <div className="h-2"></div>

      <div className="w-full overflow-x-auto h-full">  
        <Card className="border-none shadow-lg min-w-[1110px] mx-3 sm:mx-4 overflow-hidden">
          
        <CardContent className="p-0">
          <div className="">
            <Table className="w-full ">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-semibold text-gray-600 w-[90px]">ID</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[180px] ">名前</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[100px]">勤務状況</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[100px]">労働時間</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[110px]">在留資格</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[130px]">在留期限</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[90px]">承認勤務</TableHead>
                  <TableHead className="font-semibold text-gray-600 w-[110px]">最終勤務日</TableHead>
                  <TableHead className="font-semibold text-gray-600 min-w-[200px]">備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.user_id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium ">
                      <div className="">
                        {formatEmpId(employee.emp_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.image_url} alt={employee.english_name} className="object-cover" />
                          <AvatarFallback>{employee.english_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="font-semibold">{employee.english_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-40">{getWorkStatusBadge(employee.work_status)}</TableCell>
                    <TableCell className="max-w-40">
                      <div className="flex items-center gap-2">
                        {employee.weekly_hours}
                        {employee.weekly_hours > 40 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>週40時間を超える労働時間です</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-44">{residenceStatusTranslation[employee.residence_status]}</TableCell>
                    <TableCell className="max-w-56" >
                      <div className="flex items-center gap-2">
                        {employee.expiration_date}
                        { employee.expiration_date && new Date(employee.expiration_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>在留期限が90日以内です</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-28">
                      {employee.unapproved_shifts > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {employee.unapproved_shifts}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{employee.unapproved_shifts}件の未承認勤務があります</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="secondary">なし</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-32">{employee.last_work_day}</TableCell>
                    <TableCell className="">{employee.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}