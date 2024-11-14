import React from 'react';
import { Clock, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { EmployeeStatistics } from '@/types/employee';

interface StatisticsTabProps {
  employeeStats: EmployeeStatistics;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ employeeStats }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          icon={<Clock className="w-8 h-8 text-gray-500" />}
          title="労働時間"
          mainStat={`${(employeeStats.monthlyHours.approved + employeeStats.monthlyHours.unapproved).toFixed(1)}時間 / 月`}
          subStats={[
            { label: '週間', value: `${(employeeStats.weeklyHours.approved + employeeStats.weeklyHours.unapproved).toFixed(1)}時間` },
            { label: '承認済み', value: `${employeeStats.monthlyHours.approved.toFixed(1)}時間`, icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
            { label: '未承認', value: `${employeeStats.monthlyHours.unapproved.toFixed(1)}時間`, icon: <AlertCircle className="w-4 h-4 text-yellow-600" /> }
          ]}
        />

        <StatCard
          icon={<DollarSign className="w-8 h-8 text-gray-500" />}
          title="給与情報"
          mainStat={`¥${(employeeStats.monthlySalary.approved + employeeStats.monthlySalary.unapproved).toLocaleString()} / 月`}
          subStats={[
            { label: '時給', value: `¥${employeeStats.hourlyRate.toLocaleString()}` },
            { label: '承認済み', value: `¥${employeeStats.monthlySalary.approved.toLocaleString()}`, icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
            { label: '未承認', value: `¥${employeeStats.monthlySalary.unapproved.toLocaleString()}`, icon: <AlertCircle className="w-4 h-4 text-yellow-600" /> }
          ]}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
          <Calendar className="mr-2 w-6 h-6 text-gray-500" />
          直近7日間の労働時間
        </h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{employeeStats.recentWeekHours.toFixed(1)} / 28 時間</span>
            <span className="text-sm font-medium text-gray-600">{(28 - employeeStats.recentWeekHours).toFixed(1)}時間 残り</span>
          </div>
          <Progress value={employeeStats.recentWeekHours / 28 * 100} className="h-2 w-full" />
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        ※ 未承認の労働時間と給与は、承認後に変更される可能性があります。
      </p>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  mainStat: string;
  subStats: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, mainStat, subStats }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-semibold ml-2 text-gray-700">{title}</h3>
      </div>
      <p className="text-2xl font-bold mb-4 text-gray-800">{mainStat}</p>
      <div className="space-y-2">
        {subStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-sm font-medium flex items-center text-gray-700">
              {stat.icon && <span className="mr-1">{stat.icon}</span>}
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};