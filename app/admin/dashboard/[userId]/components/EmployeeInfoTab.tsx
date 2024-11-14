'use client'

import { Button } from "@/components/ui/button"
import { Employee } from "@/types/employee"
interface EmployeeInfoTabProps {
  employee: Employee
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {

  const infoItems = [
    { label: "名前", value: employee.nationality === 'Japan' ? `${employee.japanese_name} (${employee.english_name})` : employee.english_name },
    { label: "国籍", value: employee.nationality },
    { label: "メールアドレス", value: employee.email },
    ...(employee.nationality !== 'Japan' ? [
      { label: "在留資格", value: employee.residence_status },
      { label: "在留期限", value: employee.expiration_date },
    ] : [])
  ];

  return (
    <div className="space-y-2">
      {infoItems.map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-500 mb-0.5">{item.label}</h3>
          <p className="text-gray-800">{item.value}</p>
        </div>
      ))}
      <div className='h-[1px] sm:h-1'></div>
      <div className="text-end">
        <Button 
          variant="outline" 
          className="" 
          onClick={() => {alert("この機能はまだ実装されていません...")}}
        >
            情報変更
        </Button>
      </div>
    </div>
  );
} 