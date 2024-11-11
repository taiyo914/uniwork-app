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
import { Camera, Globe, Settings, User, Upload } from 'lucide-react'

export default function EnhancedProfileEditor() {
  const [avatarSrc, setAvatarSrc] = useState("/placeholder.svg?height=96&width=96")
  const [isUploading, setIsUploading] = useState(false)

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
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <div className="text-2xl font-semibold ml-1 mb-1">Taiyo Suzuki</div>
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
                    <Input id="languages" placeholder="例: 日本語、英語、中国語" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="favorite-foods" className="font-semibold text-gray-600">食事の好み</Label>
                    <div className="space-y-2 sm:space-y-4 ml-2">
                      <div className="space-y-1 ">
                        <Label htmlFor="favorite-foods" className="font-semibold text-gray-500 ">好きなもの</Label>
                        <Input id="favorite-foods" placeholder="例: 寿司、ラーメン、天ぷら" />
                      </div>
                      <div className="space-y-1 ">
                        <Label htmlFor="food-allergies" className="font-semibold text-gray-500 ">食べられないもの</Label>
                        <Input id="food-allergies" placeholder="例: ピーナッツ、卵、乳製品" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 ">
                    <Label htmlFor="hobbies" className="font-semibold text-gray-600">好きなこと・趣味</Label>
                    <Input id="hobbies" placeholder="例: 読書、旅行、料理" />
                  </div>

                  <div className="space-y-1 ">
                    <Label htmlFor="please-know" className="font-semibold text-gray-600">Please know</Label>
                    <Textarea 
                      id="please-know" 
                      placeholder="宗教や信条、家庭の事情、語学レベルなど、みんなに知っておいてほしいことを記入してください。" 
                      className="h-32"
                    />
                  </div>
                </div>

                <div className="h-3.5 sm:h-4"></div>

                <div className="flex justify-end ">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white min-w-24 font-semibold">保存</Button>
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
                  <Select>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpy">日本円 (JPY)</SelectItem>
                      <SelectItem value="usd">US Dollar (USD)</SelectItem>
                      <SelectItem value="eur">Euro (EUR)</SelectItem>
                      <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="app-language" className="font-semibold text-gray-600">言語設定</Label>
                  <Select>
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
                  { label: '名前', value: '山田 太郎' },
                  { label: '国籍', value: '日本' },
                  { label: 'メールアドレス', value: 'taro.yamada@example.com' },
                  { label: '在留資格', value: '就労ビザ' },
                  { label: '在留期限', value: '2025年12月31日' },
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