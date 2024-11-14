'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

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

interface SettingsTabProps {
  profile: Profile
  initialProfile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

const LANGUAGES = [
  { code: "ja", name: "日本語 (Japanese)" },       
  { code: "ar", name: "العربية (Arabic)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "en", name: "English" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fa", name: "فارسی (Persian)" },
  { code: "fr", name: "Français (French)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "id", name: "Bahasa Indonesia (Indonesian)" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "ms", name: "Bahasa Melayu (Malay)" },
  { code: "my", name: "မြန်မာဘာသာ (Burmese)" },
  { code: "ne", name: "नेपाली (Nepali)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "sw", name: "Kiswahili (Swahili)" },
  { code: "th", name: "ไทย (Thai)" },
  { code: "tr", name: "Türkçe (Turkish)" },
  { code: "uk", name: "Українська (Ukrainian)" },
  { code: "vi", name: "Tiếng Việt (Vietnamese)" },
  { code: "zh", name: "中文 (Chinese)" }
]

const CURRENCIES = [
  { code: "JPY", name: "Japanese Yen" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "IRR", name: "Iranian Rial" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "KRW", name: "South Korean Won" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "THB", name: "Thai Baht" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "GBP", name: "British Pound" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "ZAR", name: "South African Rand" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MZN", name: "Mozambican Metical" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" }
]

export function SettingsTab({ profile, initialProfile, setProfile }: SettingsTabProps) {
  const [isSettingsSaving, setIsSettingsSaving] = useState(false)
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false)
  const router = useRouter()

  const handleSettingsSave = async () => {
    setIsSettingsSaving(true)
    const supabase = createClient()
    
    try {
      const updateData = {
        locale: profile.locale,
        currency: profile.currency,
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', profile.user_id)

      if (error) {
        console.error('設定の更新に失敗しました:', error)
        return
      }

      setSettingsSaveSuccess(true)
      
      setTimeout(() => {
        setSettingsSaveSuccess(false)
      }, 3000)
      
    } finally {
      setIsSettingsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="app-language" className="font-semibold text-gray-600">言語設定</Label>
        <Select
          value={profile.locale}
          onValueChange={(value) => setProfile({ ...profile, locale: value })}
        >
          <SelectTrigger id="app-language">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px] overflow-y-auto">
            {LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="currency" className="font-semibold text-gray-600">通貨</Label>
        <Select
          value={profile.currency}
          onValueChange={(value) => setProfile({ ...profile, currency: value })}
        >
          <SelectTrigger id="currency">
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px] overflow-y-auto">
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} ({currency.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-end">
        <Button 
          onClick={handleSettingsSave}
          disabled={isSettingsSaving || settingsSaveSuccess}
          className="min-w-20 text-sm py-1.5 font-semibold transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white opacity-100 disabled:opacity-100"
        >
          {settingsSaveSuccess ? (
            <div className="flex items-center justify-center">
              <Check className="w-3.5 h-3.5 mr-1" />
              <span>保存済み</span>
            </div>
          ) : (
            <span>保存</span>
          )}
        </Button>
      </div>
    </div>
  )
} 