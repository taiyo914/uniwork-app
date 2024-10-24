"use client"
import { useState } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'

type Employee = {
  id: string;
  name: string;
  nationality: string;
  position: string;
  avatar: string;
  hourlyRate: number;
  hoursWorked: number;
}

export default function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Employee>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  const employees: Employee[] = [
    { id: "EMP001", name: "王 小明", nationality: "中国", position: "キッチンスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1100, hoursWorked: 80 },
    { id: "EMP002", name: "Kim Minseo", nationality: "韓国", position: "ホールスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1050, hoursWorked: 64 },
    { id: "EMP003", name: "Nguyen Van A", nationality: "ベトナム", position: "キッチンスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1100, hoursWorked: 88 },
    { id: "EMP004", name: "Garcia Maria", nationality: "フィリピン", position: "ホールスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1050, hoursWorked: 72 },
    { id: "EMP005", name: "佐藤 花子", nationality: "日本", position: "マネージャー", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1500, hoursWorked: 160 },
    { id: "EMP006", name: "李 美玲", nationality: "台湾", position: "キッチンスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1100, hoursWorked: 96 },
    { id: "EMP007", name: "Sharma Raj", nationality: "インド", position: "ホールスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1050, hoursWorked: 56 },
    { id: "EMP008", name: "田中 太郎", nationality: "日本", position: "キッチンスタッフ", avatar: "/placeholder.svg?height=40&width=40", hourlyRate: 1200, hoursWorked: 120 },
  ]

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

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

  const handleRowClick = (employeeId: string) => {
    router.push(`/employee/${employeeId}`)
  }

  return (<>
    <header className="text-3xl font-bold p-4 bg-white text-black">管理者画面</header>
    <div className="p-4 mx-auto bg-gray-50">
      <Card className="shadow-lg mb-8 rounded-lg">
        <CardHeader className="bg-blue-400 text-white flex flex-row justify-between items-center rounded-t-lg">
          <CardTitle className="text-2xl font-bold"><Users className="mb-1 mr-1 inline"/>従業員一覧</CardTitle>
          <Button variant="secondary" size="sm" className="bg-white text-blue-800 hover:bg-blue-100 transition-colors">
            <UserPlus className="mb-0.5 -mr-1" />
            従業員登録
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          
          <Table className="w-full min-w-[800px] ">
            <TableHeader>
              <TableRow className="bg-blue-100 hover:bg-blue-100">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    名前 {renderSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('nationality')}>
                  <div className="flex items-center">
                    国籍 {renderSortIcon('nationality')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('position')}>
                  <div className="flex items-center">
                    役職 {renderSortIcon('position')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('hourlyRate')}>
                  <div className="flex items-center">
                    時給 {renderSortIcon('hourlyRate')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('hoursWorked')}>
                  <div className="flex items-center">
                    労働時間 {renderSortIcon('hoursWorked')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow 
                  key={employee.id} 
                  className="hover:bg-gray-50 cursor-pointer" 
                  onClick={() => handleRowClick(employee.id)}
                >
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.nationality}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.hourlyRate}円</TableCell>
                  <TableCell>{employee.hoursWorked}時間</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </>)
}