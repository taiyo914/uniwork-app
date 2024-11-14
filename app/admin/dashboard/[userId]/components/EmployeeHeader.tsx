import React from 'react';
import { MessageSquare, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Employee } from '@/types/employee';

interface EmployeeHeaderProps {
  employee: Employee;
  onChatOpen: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ 
  employee, 
  onChatOpen 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={employee.image_url} alt={employee.english_name} />
          <AvatarFallback>{employee.english_name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{employee.english_name}</h2>
          <p className="text-sm text-gray-700">ID: {employee.user_id} </p>
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