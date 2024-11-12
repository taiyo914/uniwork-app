"use client";
import { useState, useEffect } from "react";
import { UserPlus, Users, LogOut, Loader, Earth } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { countryTranslation } from "./countryTranslation";
import { residenceStatusTranslation } from "./residenceStatusTranslation";
import { useLogout } from "@/hooks/useLogout";

type Employee = {
  user_id: string;
  emp_id: number;
  english_name: string;
  japanese_name: string;
  nationality: string;
  residence_status: string;
  expiration_date: string;
  hourly_wage: number;
  image_url: string;
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof Employee>("emp_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const router = useRouter();
  const handleLogout = useLogout();
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, emp_id, english_name, japanese_name, nationality, residence_status, expiration_date, hourly_wage, image_url"
        )
        .eq("role", "employee");

      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        setEmployees(data || []);
      }
      setLoading(false)
    };

    fetchEmployees();
  }, []);

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue: string | number = a[sortColumn];
    let bValue: string | number = b[sortColumn];

    // 国籍と在留資格の時は日本語の翻訳を参照
    if (sortColumn === "nationality") {
      aValue = countryTranslation[a.nationality];
      bValue = countryTranslation[b.nationality];
    } else if (sortColumn === "residence_status") {
      aValue = residenceStatusTranslation[a.residence_status];
      bValue = residenceStatusTranslation[b.residence_status];
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: keyof Employee) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: keyof Employee) => {
    if (column === sortColumn) {
      return sortDirection === "asc" ? "▲" : "▼";
    }
    return null;
  };

  const handleRowClick = (employeeId: string) => {
    router.push(`/admin/${employeeId}`);
  };

  const formatEmpId = (emp_id: number) => {
    return `EMP${emp_id.toString().padStart(3, "0")}`;
  };

  return (
    <>
      <div className="p-4 mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black">管理者画面</h1>
          </div>

          <Button onClick={handleLogout} className="hover:bg-gray-100">
            <LogOut className="-mr-0.5"/>ログアウト
          </Button>
        </header>
        <Card className="shadow-lg mb-8 rounded-lg">
          <CardHeader className="flex flex-row justify-between items-center rounded-t-lg bg-gradient-to-b from-sky-400 to-blue-400 text-white">
            <CardTitle className="text-2xl font-bold">
              <Users className="mb-1 mr-1 inline" />
              従業員一覧
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-blue-800 hover:bg-blue-100 transition-colors"
            >
              <UserPlus className="mb-0.5 -mr-1" />
              従業員登録
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader className="animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <Table className="w-full min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    {/* <TableHead className='w-8'></TableHead> */}
                    <TableHead className="cursor-pointer pl-6" onClick={() => handleSort("emp_id")}>
                      <div className="flex items-center ">社員ID {renderSortIcon("emp_id")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("japanese_name")}>
                      <div className="flex items-center">名前 {renderSortIcon("japanese_name")}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("nationality")}>
                      <div className="flex items-center">国籍 {renderSortIcon("nationality")}</div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("residence_status")}
                    >
                      <div className="flex items-center">
                        在留資格 {renderSortIcon("residence_status")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("expiration_date")}
                    >
                      <div className="flex items-center">
                        期限 {renderSortIcon("expiration_date")}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("hourly_wage")}>
                      <div className="flex items-center">時給 {renderSortIcon("hourly_wage")}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEmployees.map((employee) => (
                    <TableRow
                      key={employee.user_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(employee.user_id)}
                    >
                      <TableCell className="pl-7">{formatEmpId(employee.emp_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={employee.image_url}
                              alt={employee.english_name}
                              className="object-cover object-center w-full h-full"
                            />
                            <AvatarFallback>{employee.english_name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            {employee.japanese_name}
                            <div className="text-sm text-gray-500">{employee.english_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {countryTranslation[employee.nationality]}
                        <div className="text-sm text-gray-500">{employee.nationality}</div>
                      </TableCell>
                      <TableCell>
                        {residenceStatusTranslation[employee.residence_status]}
                        <div className="text-sm text-gray-500">{employee.residence_status}</div>
                      </TableCell>
                      <TableCell>{employee.expiration_date}</TableCell>
                      <TableCell>{employee.hourly_wage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
