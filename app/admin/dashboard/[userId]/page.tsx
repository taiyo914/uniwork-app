
import { createClient } from '@/utils/supabase/server'
import AdminEmployeeStats from './AdminEmployeeStats'
import { redirect } from 'next/navigation'
import EmployeeDashboardSample from './EmployeeDashboardSample'

export default async function AdminEmployeePage({ params }: { params: { userId: string } }) {
  const supabase = createClient()


  // 従業員の基本情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('user_id', params.userId)
    .single()

  if (!profile) {
    redirect('/admin/dashboard')
  }

  return (
    // <AdminEmployeeStats 
    //   profile={profile}
    //   userId={params.userId}
    // />
    <EmployeeDashboardSample/>
  )
} 