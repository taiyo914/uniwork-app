'use client'

import { useState, useEffect } from 'react'
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

type WorkStatus = 'working' | 'notStarted' | 'onBreak'

type Employee = {
  id: string
  empId: number
  name: string
  weeklyHours: number
  visaExpirationDate: string
  imageUrl: string
  visaStatus: string
  unapprovedShifts: number
  currentWorkStatus: WorkStatus
  lastWorkDay: string
  remarks?: string
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    empId: 1,
    name: '山田 太郎',
    weeklyHours: 38,
    visaExpirationDate: '2024-12-31',
    imageUrl: '/placeholder.svg?height=32&width=32',
    visaStatus: '技能実習',
    unapprovedShifts: 2,
    currentWorkStatus: 'working',
    lastWorkDay: '2023-06-15',
    remarks: '研修中'
  },
  {
    id: '2',
    empId: 2,
    name: '佐藤 花子',
    weeklyHours: 42,
    visaExpirationDate: '2023-08-15',
    imageUrl: '/placeholder.svg?height=32&width=32',
    visaStatus: '特定技能',
    unapprovedShifts: 0,
    currentWorkStatus: 'onBreak',
    lastWorkDay: '2023-06-14',
    remarks: '来月契約更新'
  },
  {
    id: '3',
    empId: 3,
    name: '鈴木 一郎',
    weeklyHours: 35,
    visaExpirationDate: '2025-03-31',
    imageUrl: '/placeholder.svg?height=32&width=32',
    visaStatus: '留学',
    unapprovedShifts: 1,
    currentWorkStatus: 'notStarted',
    lastWorkDay: '2023-06-13',
  },
  {
    id: '4',
    empId: 4,
    name: '高橋 美咲',
    weeklyHours: 20,
    visaExpirationDate: '2024-09-30',
    imageUrl: '/placeholder.svg?height=32&width=32',
    visaStatus: '家族滞在',
    unapprovedShifts: 0,
    currentWorkStatus: 'notStarted',
    lastWorkDay: '2023-06-12',
  },
  {
    id: '5',
    empId: 5,
    name: '田中 健太',
    weeklyHours: 40,
    visaExpirationDate: '2023-12-31',
    imageUrl: '/placeholder.svg?height=32&width=32',
    visaStatus: '技能実習',
    unapprovedShifts: 3,
    currentWorkStatus: 'working',
    lastWorkDay: '2023-06-15',
  },
]

export default function AdminDashborad() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setEmployees(mockEmployees)
      setLoading(false)
    }, 1000)
  }, [])

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
    <div className="w-full h-screen">

      <div className="h-4"></div>

      <div className="flex items-center text-xl font-semibold ml-5 sm:ml-6">
        <Users className="mr-2 h-5 w-5" />
        従業員一覧
      </div>

      <div className="h-2"></div>

      <div className="w-full overflow-x-auto h-full">  
        <Card className="border-none shadow-lg min-w-[1000px] mx-3 sm:mx-4 overflow-hidden">
          
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <div className="">
              <Table className="w-full ">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="font-semibold text-gray-600 max-w-24">ID</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-60">名前</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-40 ">勤務状況</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-40">労働時間</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-44">在留資格</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-56">在留期限</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-28">承認勤務</TableHead>
                    <TableHead className="font-semibold text-gray-600 max-w-32">最終勤務日</TableHead>
                    <TableHead className="font-semibold text-gray-600">備考</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium ">
                        <div className="max-w-16">
                          {formatEmpId(employee.empId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.imageUrl} alt={employee.name} />
                            <AvatarFallback>{employee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="font-semibold">{employee.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-40">{getWorkStatusBadge(employee.currentWorkStatus)}</TableCell>
                      <TableCell className="max-w-40">
                        <div className="flex items-center gap-2">
                          {employee.weeklyHours}
                          {employee.weeklyHours > 40 && (
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
                      <TableCell className="max-w-44">{employee.visaStatus}</TableCell>
                      <TableCell className="max-w-56" >
                        <div className="flex items-center gap-2">
                          {employee.visaExpirationDate}
                          {new Date(employee.visaExpirationDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
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
                        {employee.unapprovedShifts > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {employee.unapprovedShifts}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{employee.unapprovedShifts}件の未承認勤務があります</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="secondary">なし</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-32">{employee.lastWorkDay}</TableCell>
                      <TableCell className="">{employee.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}