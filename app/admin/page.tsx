"use client"
import { useState, useEffect } from 'react'
import { Search, UserPlus, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { countryTranslation } from './countryTranslation'
import { residenceStatusTranslation } from './residenceStatusTranslation'


type Employee = {
  id: string;
  english_name: string;
  japanese_name: string;
  nationality: string;
  residence_status: string;
  expiration_date: string;
  hourly_wage: number;
  image_url: string;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [sortColumn, setSortColumn] = useState<keyof Employee>('english_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, english_name, japanese_name, nationality, residence_status, expiration_date, hourly_wage, image_url')
        .eq('role', 'employee')

      if (error) {
        console.error("Error fetching employees:", error)
      } else {
        setEmployees(data || [])
      }
    }

    fetchEmployees()
  }, [])


  const sortedEmployees = employees.sort((a, b) => {
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
    <div className="p-4 mx-auto bg-gray-50">
    <header className="text-3xl font-bold pb-3 ml-2">管理者画面</header>
      <Card className="shadow-lg mb-8 rounded-lg">
        <CardHeader className="bg-blue-400 text-white flex flex-row justify-between items-center rounded-t-lg">
          <CardTitle className="text-2xl font-bold"><Users className="mb-1 mr-1 inline"/>従業員一覧</CardTitle>
          <Button variant="secondary" size="sm" className="bg-white text-blue-800 hover:bg-blue-100 transition-colors">
            <UserPlus className="mb-0.5 -mr-1" />
            従業員登録
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          
          <Table className="w-full min-w-[850px] ">
            <TableHeader>
              <TableRow className="bg-blue-100 hover:bg-blue-100">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('english_name')}>
                  <div className="flex items-center">
                    英語名 {renderSortIcon('english_name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('japanese_name')}>
                  <div className="flex items-center">
                    日本語名 {renderSortIcon('japanese_name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('nationality')}>
                  <div className="flex items-center">
                    国籍 {renderSortIcon('nationality')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('residence_status')}>
                  <div className="flex items-center">
                    在留資格 {renderSortIcon('residence_status')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('expiration_date')}>
                  <div className="flex items-center">
                    期限 {renderSortIcon('expiration_date')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('hourly_wage')}>
                  <div className="flex items-center">
                    時給 {renderSortIcon('hourly_wage')}
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
                      <AvatarImage src={employee.image_url} alt={employee.english_name} className="object-cover object-center w-full h-full"/>
                      <AvatarFallback>{employee.english_name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.english_name}</TableCell>
                  <TableCell>{employee.japanese_name}</TableCell>
                  <TableCell>{countryTranslation[employee.nationality]}</TableCell>
                  <TableCell>{residenceStatusTranslation[employee.residence_status]}</TableCell>
                  <TableCell>{employee.expiration_date}</TableCell>
                  <TableCell>{employee.hourly_wage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </>)
}