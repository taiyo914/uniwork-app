export type BreakLog = {
  break_start: string;
  break_end: string;
  memo: string;
};

export type AttendanceLog = {
  id: string;
  work_start: string;
  work_end: string;
  memo: string;
  approved: boolean;
  break_logs: BreakLog[];
};

export interface Stats {
  weekly: { total: number; approved: number; unapproved: number };
  lastSevenDays: { total: number; approved: number; unapproved: number };
  monthly: { total: number; approved: number; unapproved: number };
  income: { total: number; approved: number; unapproved: number; hourlyWage: number; currency: string };
}

export interface Profile {
  user_id: string;
  emp_id: string;
  image_url: string;
  english_name: string;
  japanese_name: string;
  nationality: string;
  email: string;
  residence_status: string;
  expiration_date: string;
  hourly_wage: number;
  currency: string;
  work_status: string;
  employment_type: string;
}
