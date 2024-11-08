export type Profile = {
  user_id: string;
  english_name: string;
  hourly_wage: number;
  work_status: "notStarted" | "working" | "onBreak";
}; 