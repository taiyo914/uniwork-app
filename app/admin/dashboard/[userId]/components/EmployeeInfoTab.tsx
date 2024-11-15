'use client'

import { Button } from "@/components/ui/button"
import { Profile } from '../employee';
import { format } from "date-fns";
import { residenceStatusTranslation } from "@/app/admin/residenceStatusTranslation";
import { countryTranslation } from "@/app/admin/countryTranslation";

interface EmployeeInfoTabProps {
  employee: Profile
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {
  const isExpirationDateNear = () => {
    if (employee.nationality === 'Japan') return false;
    const expirationDate = new Date(employee.expiration_date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 90;
  };

  const infoItems = [
    { label: "名前", value: employee.nationality === 'Japan' ? `${employee.japanese_name} (${employee.english_name})` : employee.english_name },
    { label: "国籍", value: `${countryTranslation[employee.nationality]} (${employee.nationality.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})` },
    { label: "メールアドレス", value: employee.email },
    ...(employee.nationality !== 'Japan' ? [
      { label: "在留資格", value: `${residenceStatusTranslation[employee.residence_status]} (${employee.residence_status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')})` },
      { label: "在留期限", value: format(new Date(employee.expiration_date), 'yy/MM/dd') },
    ] : [])
  ];

  return (
    <div className="space-y-2">
      {isExpirationDateNear() && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <p className="text-red-800 font-medium">⚠️ 在留期限が90日以内に迫っています</p>
          <p className="text-red-600 text-sm mt-1">在留期限の更新手続きを確認してください</p>
        </div>
      )}
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