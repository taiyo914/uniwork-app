'use client'

import { useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Upload, Loader2, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';

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

interface ProfileTabProps {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

// キャッシュブレーカー
const addCacheBreaker = (url: string) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${new Date().getTime()}`;
}

export function ProfileTab({ profile, setProfile }: ProfileTabProps) {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`profile.profile.${key}`);
  
  const [avatarSrc, setAvatarSrc] = useState((profile.image_url) || "/placeholder.svg?height=96&width=96") 
    // addCacheBreaker(profile.image_url)とするとキャッシュが回避できるが、ページを開くたびに一瞬だけちらつきがある
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0]

    console.log('ファイル圧縮イベント開始', file)

    if (file) {
      setIsUploading(true)
      
      try {
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.7
        };

        const compressed = await imageCompression(file, options)
        
        const newFileName = `${file.name.split('.')[0]}.jpg`
        const convertedFile = new File([compressed], newFileName, { type: 'image/jpeg' })
        
        console.log('圧縮に成功', convertedFile)
        
        setCompressedFile(convertedFile)

        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarSrc(reader.result as string)
          setIsUploading(false)
          setIsDialogOpen(false)
        }
        reader.readAsDataURL(convertedFile)
      } catch (error) {
        console.error('エラー: 画像の圧縮に失敗しました:', error)
        setIsUploading(false)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()
    
    try {
      if (compressedFile) {
        const filePath = `profile/${profile.user_id}.jpg`
        console.log('1. 画像アップロードを開始', filePath)
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, compressedFile, {
            upsert: true,
          })

        if (uploadError) {
          console.error('画像のアップロードに失敗:', uploadError)
          return
        }

        console.log('2. 画像のアップロードに成功')

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath)

        profile.image_url = publicUrl
        
        console.log('3. 公開URLを取得', profile.image_url)
      }

      const updateData = {
        image_url: profile.image_url,
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
        console.error('プロフィールの更新に失敗:', error)
        return
      }

      console.log('4. プロフィールの更新に成功')

      setCompressedFile(null)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center space-x-4 mt-1">
          <Avatar className="w-24 h-24 border border-blue-200">
            <AvatarImage src={avatarSrc} alt="プロフィール画像" className="object-cover" />
            <AvatarFallback className="bg-blue-200 text-blue-800 text-lg">{profile.english_name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-2xl font-semibold ml-1 mb-1">{profile.english_name}</div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-1 px-3 py-2">
                  <Camera className="w-4 h-4" />
                  <span>{t('changeImage')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('uploadTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('uploadDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={avatarSrc} alt="プロフィール画像" className="object-cover"/>
                    <AvatarFallback>{profile.english_name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Label htmlFor="picture" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? t('uploading') : t('selectFile')}</span>
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

        {compressedFile && (
          <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-md">
            {t('cacheNotice')}
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="languages" className="font-semibold text-gray-600">{t('languages')}</Label>
          <Input 
            id="languages" 
            value={profile.languages}
            onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
            placeholder="Example: English, Japanese, Chinese" 
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="favorite-foods" className="font-semibold text-gray-600">{t('foodPreferences')}</Label>
          <div className="space-y-2 sm:space-y-4 ml-2">
            <div className="space-y-1">
              <Label htmlFor="favorite-foods" className="font-semibold text-gray-500">{t('favorites')}</Label>
              <Input 
                id="favorite-foods"
                value={profile.favorite_foods}
                onChange={(e) => setProfile({ ...profile, favorite_foods: e.target.value })}
                placeholder="Example: Sushi, Ramen, Tempura" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="food-allergies" className="font-semibold text-gray-500">{t('restrictions')}</Label>
              <Input 
                id="food-allergies"
                value={profile.dietary_restrictions}
                onChange={(e) => setProfile({ ...profile, dietary_restrictions: e.target.value })}
                placeholder="Example: Peanuts, Eggs, Milk" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="hobbies" className="font-semibold text-gray-600">{t('hobbies')}</Label>
          <Input 
            id="hobbies"
            value={profile.hobbies}
            onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
            placeholder="Example: Reading, Traveling, Cooking" 
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="please-know" className="font-semibold text-gray-600">{t('pleaseKnow')}</Label>
          <Textarea 
            id="please-know" 
            value={profile.shared_info}
            onChange={(e) => setProfile({ ...profile, shared_info: e.target.value })}
            placeholder="Example: Religion, Belief, Family situation, Language level, etc. Please enter things you want everyone to know." 
            className="h-32"
          />
        </div>
      </div>

      <div className="h-4 sm:h-5"></div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className="min-w-20 text-sm py-1.5 font-semibold transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white opacity-100 disabled:opacity-100"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              {t('saved')}
            </>
          ) : (
            <>{t('save')}</>
          )}
        </Button>
      </div>
    </>
  );
}