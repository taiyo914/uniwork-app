export type BreakTime = {
  start: string;
  end: string;
  memo: string;
};

export type TimeStamp = {
  date: string;
  checkIn: string;
  checkOut: string;
  breakTimes: BreakTime[];
  memo: string;
  approved: boolean;
};

export type Notification = {
  id: string;
  date: string;
  message: string;
  type: 'attendance' | 'payroll' | 'hr' | 'general';
  completed: boolean;
};

export interface EmployeeStatistics {
  weeklyHours: { approved: number; unapproved: number }
  monthlyHours: { approved: number; unapproved: number }
  hourlyRate: number
  monthlySalary: { approved: number; unapproved: number }
  recentWeekHours: number
}

export interface Employee {
  name: string;
  id: string;
  avatar: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  nationality: string;
  visaStatus: string;
  languages: string[];
  emergencyContact: string;
}