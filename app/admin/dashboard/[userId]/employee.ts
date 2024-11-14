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
  weeklyWage: { approved: number; unapproved: number }
  monthlyWage: { approved: number; unapproved: number }
  hourlyRate: number
  recentWeekHours: number
}
export interface Employee {
  user_id: string
  emp_id: string
  image_url: string
  english_name: string
  japanese_name: string
  nationality: string
  email: string
  residence_status: string
  expiration_date: string
}
