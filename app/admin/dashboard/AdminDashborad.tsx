'use client'

import { useState } from 'react'
import { Users, AlertTriangle, Clock, Coffee, Info } from 'lucide-react'
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
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  sortByWorkStatus,
  sortByWeeklyHours,
  sortByUnapprovedShifts,
  sortByLastWorkDay,
  sortByResidenceStatus,
  sortByDate,
  sortByDefault
} from './sortFunctions'

type WorkStatus = 'working' | 'notStarted' | 'onBreak'

type Employee = {
  user_id: string
  emp_id: number
  english_name: string
  weekly_hours: number
  expiration_date: string
  image_url: string
  residence_status: string
  unapproved_shifts: number
  work_status: WorkStatus
  last_work_day: string | null
  remarks?: string
}

type Props = {
  initialEmployees: Employee[]
}

export default function AdminDashboard({ initialEmployees }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [sortColumn, setSortColumn] = useState<keyof Employee | 'work_status' | 'unapproved_shifts' | 'last_work_day'>('emp_id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

  // 勤務状況の優先順位マップ
  const workStatusPriority: Record<WorkStatus, number> = {
    'working': 1,    // 勤務中が最優先
    'onBreak': 2,    // 休憩中が次
    'notStarted': 3  // 勤務外が最後
  }

  // ソート関数をシンプルに整理
  const sortEmployees = (a: Employee, b: Employee) => {
    switch (sortColumn) {
      case 'work_status':
        return sortByWorkStatus(a, b, sortDirection)
      case 'weekly_hours':
        return sortByWeeklyHours(a, b, sortDirection)
      case 'unapproved_shifts':
        return sortByUnapprovedShifts(a, b, sortDirection)
      case 'last_work_day':
        return sortByLastWorkDay(a, b, sortDirection)
      case 'residence_status':
        return sortByResidenceStatus(a, b, sortDirection)
      case 'expiration_date':
        return sortByDate(a.expiration_date, b.expiration_date, sortDirection)
      default:
        return sortByDefault(a[sortColumn], b[sortColumn], sortDirection)
    }
  }

  const sortedEmployees = [...employees].sort(sortEmployees)

  const handleSort = (column: keyof Employee) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const renderSortIcon = (column: keyof Employee) => {
    if (column === sortColumn) {
      return sortDirection === 'asc' ? '▲' : '▼'
    }
    return null
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
        <Card className="border-none shadow-lg min-w-[1180px] mx-3 sm:mx-4 overflow-hidden">
          
        <CardContent className="p-0">
          <div className="">
            <Table className="w-full ">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead 
                    className="font-semibold text-gray-600 w-[90px] cursor-pointer"
                    onClick={() => handleSort('emp_id')}
                  >
                    <div className="flex items-center">
                      ID {renderSortIcon('emp_id')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[180px] cursor-pointer"
                    onClick={() => handleSort('english_name')}
                  >
                    <div className="flex items-center">
                      名前 {renderSortIcon('english_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[110px] cursor-pointer"
                    onClick={() => handleSort('work_status')}
                  >
                    <div className="flex items-center">
                      勤務状況 {renderSortIcon('work_status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[110px] cursor-pointer"
                    onClick={() => handleSort('weekly_hours')}
                  >
                    <div className="flex items-center ">
                      労働時間
                      {sortColumn === 'weekly_hours' ? (
                        " " + renderSortIcon('weekly_hours')
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info 
                                className="h-4 w-4 text-gray-400 ml-1" 
                                onClick={(e) => {e.stopPropagation();}} //アイコンをクリックしてもhandleSortが発生しないようにする
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm font-normal">直近7日間（{format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'MM/dd')}〜{format(new Date(), 'MM/dd')}）の労働時間の合計です</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[110px] cursor-pointer"
                    onClick={() => handleSort('residence_status')}
                  >
                    <div className="flex items-center">
                      在留資格 {renderSortIcon('residence_status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[130px] cursor-pointer"
                    onClick={() => handleSort('expiration_date')}
                  >
                    <div className="flex items-center">
                      在留期限 {renderSortIcon('expiration_date')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[90px] cursor-pointer"
                    onClick={() => handleSort('unapproved_shifts')}
                  >
                    <div className="flex items-center">
                      承認 {renderSortIcon('unapproved_shifts')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-gray-600 w-[120px] cursor-pointer"
                    onClick={() => handleSort('last_work_day')}
                  >
                    <div className="flex items-center">
                      最終勤務日 {renderSortIcon('last_work_day')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 min-w-[150px]">備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map((employee) => (
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
                      <div className="flex items-center gap-2 font-sans">
                        {employee.weekly_hours}
                        {(employee.residence_status === "student" || employee.residence_status === "dependent") ? (
                          // 学生・家族滞在の場合
                          employee.weekly_hours > 28 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>週28時間の労働時間制限を超過しています</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : employee.weekly_hours > 20 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>残り労働可能時間: {28 - employee.weekly_hours}時間</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Clock className="h-4 w-4 text-green-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>残り労働可能時間: {28 - employee.weekly_hours}時間</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        ) : (
                          // その他の在留資格の場合
                          employee.weekly_hours > 40 && (
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
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-44">{residenceStatusTranslation[employee.residence_status]}</TableCell>
                    <TableCell className="max-w-56" >
                      <div className="flex items-center gap-2 font-sans">
                        { employee.expiration_date && format(new Date(employee.expiration_date), 'yy/MM/dd')}
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
                              <Badge variant="secondary" className="flex items-center gap-1">
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
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-32 font-sans">
                      {employee.last_work_day ? format(new Date(employee.last_work_day), 'MM/dd (E)', { locale: ja }) : '-'}
                    </TableCell>
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