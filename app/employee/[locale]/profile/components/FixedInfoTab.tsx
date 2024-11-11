'use client'

import { Button } from "@/components/ui/button"

interface Profile {
  user_id: string
  image_url: string
  languages: string
  favorite_foods: string
  dietary_restrictions: string
  hobbies: string
  shared_info: string
  currency: string
  locale: string
  english_name: string
  nationality: string
  email: string
  residence_status: string
  expiration_date: string
}

interface FixedInfoTabProps {
  profile: Profile
}

export function FixedInfoTab({ profile }: FixedInfoTabProps) {
  return (
    <div className="space-y-2">
      {[
        { label: '名前', value: profile.english_name },
        { label: '国籍', value: profile.nationality },
        { label: 'メールアドレス', value: profile.email },
        ...(profile.nationality !== 'Japan' ? [
          { label: '在留資格', value: profile.residence_status },
          { label: '在留期限', value: profile.expiration_date },
        ] : [])
      ].map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm text-gray-500 mb-0.5">{item.label}</h3>
          <p className="text-gray-800">{item.value}</p>
        </div>
      ))}
      <div className='h-[1px] sm:h-1'></div>
      <div className=" text-end">
        <Button variant="outline" className="">情報変更を申請する</Button>
      </div>
    </div>
  )
} 