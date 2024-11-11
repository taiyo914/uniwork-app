'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Globe, Settings, User, Upload, Loader2, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

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
  const [avatarSrc, setAvatarSrc] = useState( initialProfile.image_url ||"/placeholder.svg?height=96&width=96")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarSrc(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    try {
      const updateData = {
        languages: profile.languages,
        favorite_foods: profile.favorite_foods,
        dietary_restrictions: profile.dietary_restrictions,
        hobbies: profile.hobbies,
        shared_info: profile.shared_info,
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.user_id)

      if (error) {
        console.error('プロフィールの更新に失敗しました:', error)
        return
      }

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

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
            <TabsTrigger value="profile" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm" ><User className="w-3.5 min-w-3 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5 " />プロフィール</TabsTrigger>
            <TabsTrigger value="settings" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm"><Settings className="min-w-3 w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5 " />アプリ設定</TabsTrigger>
            <TabsTrigger value="fixed" className="w-1/3 px-1 py-2 sm:py-1.5 text-xs sm:text-sm"><Globe className="min-w-3 w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1 mr-0.5 " />登録情報</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-3">
            <Card >
              <CardContent className=" pt-4 px-4 sm:px-6 pb-4 ">
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-24 h-24 ">
                      <AvatarImage src={avatarSrc} alt="プロフィール画像" className="object-cover" />
                      <AvatarFallback>{profile.english_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <div className="text-2xl font-semibold ml-1 mb-1">{profile.english_name}</div>
                        <Dialog>
                          <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center space-x-1 px-3 py-2">
                            <Camera className="w-4 h-4" />
                            <span>画像を変更</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>プロフィール画像のアップロード</DialogTitle>
                            <DialogDescription>
                              新しいプロフィール画像を選択してアップロードしてください。
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center space-y-4">
                            <Avatar className="w-32 h-32">
                              <AvatarImage src={avatarSrc} alt="プロフィール画像" />
                              <AvatarFallback>JP</AvatarFallback>
                            </Avatar>
                            <Label htmlFor="picture" className="cursor-pointer">
                              <div className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                <Upload className="w-4 h-4" />
                                <span>{isUploading ? 'アップロード中...' : 'ファイルを選択'}</span>
                              </div>
                              <Input 
                                id="picture" 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept="image/*"
                              />
                            </Label>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="languages" className="font-semibold text-gray-600">話せる言語</Label>
                    <Input 
                      id="languages" 
                      value={profile.languages}
                      onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                      placeholder="Example: English, Japanese, Chinese" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="favorite-foods" className="font-semibold text-gray-600">食事の好み</Label>
                    <div className="space-y-2 sm:space-y-4 ml-2">
                      <div className="space-y-1 ">
                        <Label htmlFor="favorite-foods" className="font-semibold text-gray-500 ">好きなもの</Label>
                        <Input 
                          id="favorite-foods"
                          value={profile.favorite_foods}
                          onChange={(e) => setProfile({ ...profile, favorite_foods: e.target.value })}
                          placeholder="Example: Sushi, Ramen, Tempura" 
                        />
                      </div>
                      <div className="space-y-1 ">
                        <Label htmlFor="food-allergies" className="font-semibold text-gray-500 ">食べられないもの</Label>
                        <Input 
                          id="food-allergies"
                          value={profile.dietary_restrictions}
                          onChange={(e) => setProfile({ ...profile, dietary_restrictions: e.target.value })}
                          placeholder="Example: Peanuts, Eggs, Milk" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 ">
                    <Label htmlFor="hobbies" className="font-semibold text-gray-600">好きなこと・趣味</Label>
                    <Input 
                      id="hobbies"
                      value={profile.hobbies}
                      onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
                      placeholder="Example: Reading, Traveling, Cooking" 
                    />
                  </div>

                  <div className="space-y-1 ">
                    <Label htmlFor="please-know" className="font-semibold text-gray-600">Please know</Label>
                    <Textarea 
                      id="please-know" 
                      value={profile.shared_info}
                      onChange={(e) => setProfile({ ...profile, shared_info: e.target.value })}
                      placeholder="Example: Religion, Belief, Family situation, Language level, etc. Please enter things you want everyone to know." 
                      className="h-32"
                    />
                  </div>
                </div>

                <div className="h-3.5 sm:h-4"></div>

                <div className="flex justify-end ">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || saveSuccess}
                    className="min-w-24 font-semibold transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white opacity-100 disabled:opacity-100"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        保存済み
                      </>
                    ) : (
                      <>
                        保存
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader className="px-4 sm:px-6 pb-4 pt-5 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl">アプリの設定</CardTitle>
                <CardDescription>アプリの基本設定を変更します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6">
                <div className="space-y-1">
                  <Label htmlFor="currency" className="font-semibold text-gray-600">通貨</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value) => setProfile({ ...profile, currency: value })}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="app-language" className="font-semibold text-gray-600">言語設定</Label>
                  <Select
                    value={profile.locale}
                    onValueChange={(value) => setProfile({ ...profile, locale: value })}
                  >
                    <SelectTrigger id="app-language">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ko">한国어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fixed">
            <Card>
              <CardHeader className="px-4 sm:px-7 pb-4 pt-5 sm:py-6">
                <CardTitle className="text-xl sm:text-2xl">登録情報</CardTitle>
                <CardDescription>これらの情報を変更するには申請が必要です。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
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
                    <p className=" text-gray-800">{item.value}</p>
                  </div>
                ))}
                <div className='h-1'></div>
                <Button variant="outline" className="w-full mt-4">情報変更を申請する</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}