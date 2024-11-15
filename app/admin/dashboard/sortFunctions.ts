import { residenceStatusTranslation } from '../residenceStatusTranslation'

type WorkStatus = 'working' | 'notStarted' | 'onBreak'

type Employee = {
  user_id: string
  emp_id: number
  english_name: string
  weekly_hours: number
  expiration_date: string
  image_url: string
  residence_status: string
  unapproved_shifts: number
  work_status: WorkStatus
  last_work_day: string | null
  remarks?: string
}

// 勤務状況の優先順位マップ
export const workStatusPriority: Record<WorkStatus, number> = {
  'working': 1,    
  'onBreak': 2,    
  'notStarted': 3 
}

export const sortByWorkStatus = (a: Employee, b: Employee, sortDirection: 'asc' | 'desc') => {
  const priorityA = workStatusPriority[a.work_status]
  const priorityB = workStatusPriority[b.work_status]
  return sortDirection === 'asc' 
    ? priorityA - priorityB 
    : priorityB - priorityA
}

export const sortByWeeklyHours = (a: Employee, b: Employee, sortDirection: 'asc' | 'desc') => {
  const hoursA = a.weekly_hours || 0
  const hoursB = b.weekly_hours || 0
  return sortDirection === 'asc' 
    ? hoursA - hoursB 
    : hoursB - hoursA
}

export const sortByUnapprovedShifts = (a: Employee, b: Employee, sortDirection: 'asc' | 'desc') => {
  const shiftsA = a.unapproved_shifts || 0
  const shiftsB = b.unapproved_shifts || 0
  return sortDirection === 'asc' 
    ? shiftsA - shiftsB 
    : shiftsB - shiftsA
}

export const sortByDate = (dateA: string | null, dateB: string | null, sortDirection: 'asc' | 'desc') => {
  if (!dateA && !dateB) return 0
  if (!dateA) return sortDirection === 'asc' ? 1 : -1
  if (!dateB) return sortDirection === 'asc' ? -1 : 1
  
  const timeA = new Date(dateA).getTime()
  const timeB = new Date(dateB).getTime()
  return sortDirection === 'asc' 
    ? timeA - timeB 
    : timeB - timeA
}

export const sortByLastWorkDay = (a: Employee, b: Employee, sortDirection: 'asc' | 'desc') => {
  return sortByDate(a.last_work_day, b.last_work_day, sortDirection)
}

export const sortByResidenceStatus = (a: Employee, b: Employee, sortDirection: 'asc' | 'desc') => {
  const statusA = residenceStatusTranslation[a.residence_status] || ''
  const statusB = residenceStatusTranslation[b.residence_status] || ''
  return sortDirection === 'asc'
    ? statusA.localeCompare(statusB, 'ja')
    : statusB.localeCompare(statusA, 'ja')
}

export const sortByDefault = (a: any, b: any, sortDirection: 'asc' | 'desc') => {
  if (a === null || a === undefined) return sortDirection === 'asc' ? 1 : -1
  if (b === null || b === undefined) return sortDirection === 'asc' ? -1 : 1
  
  if (typeof a === 'string' && typeof b === 'string') {
    return sortDirection === 'asc'
      ? a.localeCompare(b, 'ja')
      : b.localeCompare(a, 'ja')
  }
  
  if (a < b) return sortDirection === 'asc' ? -1 : 1
  if (a > b) return sortDirection === 'asc' ? 1 : -1
  return 0
} 