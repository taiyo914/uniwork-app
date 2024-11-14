import React from 'react';
import { Briefcase, MessageSquare, Calendar, Globe, FileText, Bell } from 'lucide-react'
import { Employee } from '@/types/employee';

interface EmployeeInfoTabProps {
  employee: Employee;
}

export const EmployeeInfoTab: React.FC<EmployeeInfoTabProps> = ({ employee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Briefcase className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">部署 / 役職</p>
            <p className="text-base text-gray-800">{employee.department} / {employee.position}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">連絡先</p>
            <p className="text-base text-gray-800">{employee.email}</p>
            <p className="text-base text-gray-800">{employee.phone}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">入社日</p>
            <p className="text-base text-gray-800">{employee.joinDate}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Globe className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">国籍 / 言語</p>
            <p className="text-base text-gray-800">{employee.nationality}</p>
            <p className="text-base text-gray-800">{employee.languages.join(', ')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <FileText className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">在留資格</p>
            <p className="text-base text-gray-800">{employee.visaStatus}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Bell className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">緊急連絡先</p>
            <p className="text-base text-gray-800">{employee.emergencyContact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};