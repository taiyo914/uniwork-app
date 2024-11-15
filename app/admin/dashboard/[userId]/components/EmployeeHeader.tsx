import React from 'react';
import { MessageSquare, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Profile } from '../employee';
import { Badge } from '@/components/ui/badge';

interface EmployeeHeaderProps {
  employee: Profile;
  onChatOpen: () => void;
}

const getWorkStatusBadge = (status: string) => {
  switch (status) {
    case 'working':
      return <Badge className="text-xs border-green-300 bg-green-100 text-green-800 px-3 py-1"> 勤務中</Badge>
    case 'onBreak':
      return <Badge className="text-xs border-yellow-300 bg-yellow-100 text-yellow-800 px-3 py-1"> 休憩中</Badge>
    case 'notStarted':  
      return <Badge className="text-xs border-blue-300 bg-blue-100 text-blue-800 px-3 py-1">勤務外</Badge>
  }
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ 
  employee, 
  onChatOpen 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={employee.image_url} alt={employee.english_name} className="object-cover" />
          <AvatarFallback>{employee.english_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{employee.english_name}</h2>
            <p className="text-sm text-gray-700">{employee.employment_type === 'full-time' ? '正社員' : 'アルバイト'}</p>
          </div>
          <div>{getWorkStatusBadge(employee.work_status)}</div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={onChatOpen} className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          チャット
        </Button>
       
      </div>
    </div>
  );
}; 