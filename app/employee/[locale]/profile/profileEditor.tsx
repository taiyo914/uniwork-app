'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, Settings, User } from 'lucide-react'
import { ProfileTab } from './components/ProfileTab'
import { SettingsTab } from './components/SettingsTab'
import { FixedInfoTab } from './components/FixedInfoTab'

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

interface ProfileEditorProps {
  initialProfile: Profile
}

export default function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-4 sm:h-5"></div>

        <h1 className="text-xl sm:text-2xl font-bold">
          プロフィール設定
        </h1>

        <div className="h-3 sm:h-4"></div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm">
              <User className="w-3.5 min-w-3 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5" />
              プロフィール
            </TabsTrigger>
            <TabsTrigger value="settings" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Settings className="min-w-3 w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5" />
              アプリ設定
            </TabsTrigger>
            <TabsTrigger value="fixed" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Globe className="min-w-3 w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5" />
              登録情報
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-3">
            <Card>
              <CardContent className="pt-4 px-4 sm:px-6 pb-4 sm:pb-5">
                <ProfileTab profile={profile} setProfile={setProfile} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="px-4 sm:px-6 pb-4 pt-5 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl">アプリの設定</CardTitle>
                <CardDescription>アプリの基本設定を変更します。</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6">
                <SettingsTab 
                  profile={profile} 
                  initialProfile={initialProfile} 
                  setProfile={setProfile} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fixed">
            <Card>
              <CardHeader className="px-4 sm:px-7 pb-4 pt-5 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl">登録情報</CardTitle>
                <CardDescription>これらの情報を変更するには申請が必要です。</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <FixedInfoTab profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}