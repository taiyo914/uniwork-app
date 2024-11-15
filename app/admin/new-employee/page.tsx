'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { Checkbox } from "@/components/ui/checkbox"
import { countries } from './countries';

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const residenceStatuses = {
  "就労制限なし": ["永住者", "日本人の配偶者等", "永住者の配偶者等", "定住者",],
  "在留資格に基づく就労活動のみ可": ["特定技能（1号）", "技術・人文知識・国際業務", "特定活動（46号）", "技能"],
  "就労不可": ["留学", "家族滞在"]
}

export default function UpdatedEmployeeRegistrationForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    nationality: 'japanese',
    address: '',
    phone: '',
    residenceStatus: '',
    workRestriction: '',
    additionalInfo: '',
    workHours: '',
    jobType: '',
    countryOfOrigin: '',
  })

  const initialCheckboxStates = Object.fromEntries(
    Array.from({ length: 19 }, (_, i) => [`check${i + 1}`, false])
  )

  const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>(initialCheckboxStates);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Form submitted', formData)
    // 実際はデータベースに情報を登録する処理を行う
  }

  const handleCheckboxChange = (id: string) => {
    setCheckboxStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllCheckboxesChecked = () => {
    switch (formData.residenceStatus) {
      case "特定技能（1号）":
        return checkboxStates.check1 && checkboxStates.check2 && checkboxStates.check3 && checkboxStates.check4;
      case "技術・人文知識・国際業務":
        return checkboxStates.check5 && checkboxStates.check6 && checkboxStates.check7;
      case "特定活動（46号）":
        return checkboxStates.check8 && checkboxStates.check9 && checkboxStates.check10 && checkboxStates.check11;
      case "技能":
        return checkboxStates.check12 && checkboxStates.check13 && checkboxStates.check14 && checkboxStates.check15;
      case "留学":
        return checkboxStates.check16 && checkboxStates.check17 && checkboxStates.check18 && checkboxStates.check19;
      case "家族滞在":
        return checkboxStates.check16 && checkboxStates.check17 && checkboxStates.check18;
      default:
        return true;
    }
  };

  const renderResidenceStatusInfo = () => {
    const checkedCheckboxStyle = "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-400"

    switch (formData.residenceStatus) {
      case "永住者":
      case "日本人の配偶者等":
      case "永住者の配偶者等":
      case "定住者":
        return (
          <Alert className="bg-green-50 border border-green-200 text-green-700 flex">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-1 mt-0.5" />
            <AlertDescription className="text-green-700 text-lg">
              就労制限はなく、全ての業務に従事できます。
            </AlertDescription>
          </Alert>
        )
      case "特定技能（1号）":
        return (
          <div>
            <div className="flex items-center gap-1 pt-1 mb-2 ml-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目を確認してください</span>
            </div>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700 ">
              <AlertDescription className="text-yellow-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check1" checked={checkboxStates.check1} onCheckedChange={() => handleCheckboxChange('check1')} className={checkedCheckboxStyle} />
                  <label htmlFor="check1" className='cursor-pointer'> 正社員としての雇用のみ可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check2" checked={checkboxStates.check2} onCheckedChange={() => handleCheckboxChange('check2')} className={checkedCheckboxStyle} />
                  <label htmlFor="check2" className='cursor-pointer'> 週30時間以上の勤務が必要です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check3" checked={checkboxStates.check3} onCheckedChange={() => handleCheckboxChange('check3')} className={checkedCheckboxStyle} />
                  <label htmlFor="check3" className='cursor-pointer'> 飲食業務には外食業技能測定試験の合格が必要です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check4" checked={checkboxStates.check4} onCheckedChange={() => handleCheckboxChange('check4')} className={checkedCheckboxStyle} />
                  <label htmlFor="check4" className='cursor-pointer'> 専門外の業務には資格外活動許可が必要です</label>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )
      case "技術・人文知識・国際業務":
        return (
          <div>
            <div className="flex items-center gap-1 pt-1 mb-2 ml-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目を確認してください</span>
            </div>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700 ">
              <AlertDescription className="text-yellow-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check5" checked={checkboxStates.check5} onCheckedChange={() => handleCheckboxChange('check5')} className={checkedCheckboxStyle} />
                  <label htmlFor="check5" className='cursor-pointer'> 専門知識を活かした業務のみ従事可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check6" checked={checkboxStates.check6} onCheckedChange={() => handleCheckboxChange('check6')} className={checkedCheckboxStyle} />
                  <label htmlFor="check6" className='cursor-pointer'> 単純作業（調理・接客等）はできません</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check7" checked={checkboxStates.check7} onCheckedChange={() => handleCheckboxChange('check7')} className={checkedCheckboxStyle} />
                  <label htmlFor="check7" className='cursor-pointer'> 専門外の業務には資格外活動許可が必要です</label>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )
      case "特定活動（46号）":
        return (
         <div>
            <div className="flex items-center gap-1 pt-1 mb-2 ml-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目を確認してください</span>
            </div>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700 ">
              <AlertDescription className="text-yellow-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check8" checked={checkboxStates.check8} onCheckedChange={() => handleCheckboxChange('check8')} className={checkedCheckboxStyle} />
                  <label htmlFor="check8" className='cursor-pointer'> 正社員としての雇用のみ可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check9" checked={checkboxStates.check9} onCheckedChange={() => handleCheckboxChange('check9')} className={checkedCheckboxStyle} />
                  <label htmlFor="check9" className='cursor-pointer'> 日本の高等教育機関を卒業し、高度な日本語能力を有する必要があります</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check10" checked={checkboxStates.check10} onCheckedChange={() => handleCheckboxChange('check10')} className={checkedCheckboxStyle} />
                  <label htmlFor="check10" className='cursor-pointer'>単純作業（調理・接客等）はできません</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check11" checked={checkboxStates.check11} onCheckedChange={() => handleCheckboxChange('check11')} className={checkedCheckboxStyle} />
                  <label htmlFor="check11" className='cursor-pointer' >専門外の業務には資格外活動許可が必要です</label>
                </div>
              </AlertDescription>
            </Alert>
         </div>
        )
      case "技能":
        return (
          <div>
            <div className="flex items-center gap-1 pt-1 mb-2 ml-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目を確認してください</span>
            </div>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700 ">
              <AlertDescription className="text-yellow-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check12" checked={checkboxStates.check12} onCheckedChange={() => handleCheckboxChange('check12')} className={checkedCheckboxStyle} />
                  <label htmlFor="check12" className='cursor-pointer' >正社員としての雇用のみ可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check13" checked={checkboxStates.check13} onCheckedChange={() => handleCheckboxChange('check13')} className={checkedCheckboxStyle} />
                  <label htmlFor="check13" className='cursor-pointer' >調理師として10年以上の実務経験が必要です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check14" checked={checkboxStates.check14} onCheckedChange={() => handleCheckboxChange('check14')} className={checkedCheckboxStyle} />
                  <label htmlFor="check14" className='cursor-pointer' >調理業務のみ従事可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check15" checked={checkboxStates.check15} onCheckedChange={() => handleCheckboxChange('check15')} className={checkedCheckboxStyle} />
                  <label htmlFor="check15" className='cursor-pointer' >専門外の業務には資格外活動許可が必要です</label>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )
      case "留学":
      case "家族滞在":
        return (
          <div>
            <div className="flex items-center gap-1 pt-1 mb-2 ml-1">
              <AlertCircle className="h-5 w-5 text-yellow-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目を確認してください</span>
            </div>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700">
              <AlertDescription className="text-yellow-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check16" checked={checkboxStates.check16} onCheckedChange={() => handleCheckboxChange('check16')} className={checkedCheckboxStyle} />
                  <label htmlFor="check16" className='cursor-pointer' >アルバイトとしての雇用のみ可能です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check17" checked={checkboxStates.check17} onCheckedChange={() => handleCheckboxChange('check17')} className={checkedCheckboxStyle} />
                  <label htmlFor="check17" className='cursor-pointer' >資格外活動許可を取得していることが必要です</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check18" checked={checkboxStates.check18} onCheckedChange={() => handleCheckboxChange('check18')} className={checkedCheckboxStyle} />
                  <label htmlFor="check18" className='cursor-pointer' >週28時間以内の就労が可能です</label>
                </div>
                {formData.residenceStatus === "留学" && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="check19" checked={checkboxStates.check19} onCheckedChange={() => handleCheckboxChange('check19')} className={checkedCheckboxStyle} />
                    <label htmlFor="check19" className='cursor-pointer' >長期休暇中は1日8時間まで就労可能です</label>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-7 pb-16">
      <div className="w-full max-w-[1100px]">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-7">従業員登録フォーム</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xl font-medium text-gray-700 block text-center mb-4">国籍を選択してください</Label>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => {
                          updateFormData('nationality', 'japanese')
                          setStep(3)
                        }}
                        className="w-40 py-6 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        日本
                      </Button>
                      <Button
                        onClick={() => {
                          updateFormData('nationality', 'foreign')
                          setStep(2)
                        }}
                        className="w-40 py-6 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        外国籍
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && formData.nationality === 'foreign' && (
              <motion.div
                key="step2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className='max-w-[600px] lg:max-w-none mx-auto'
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 ">
                  <Alert className="bg-gray-100 border border-gray-300 text-gray-700 font-medium">
                    <AlertDescription className="text-gray-700 text-lg">
                    <Info className="h-5 w-5 text-gray-600 inline-block mb-1 mr-1" />
                      {formData.workRestriction === '' ? (
                        <>
                          在留カードの<strong>「就労制限の有無」</strong>の欄を見てください
                          <Image src="/Images/front-1.jpg" alt="在留カード" width={500} height={300} className="mx-auto mt-1 rounded-lg" />
                        </>
                      ) : formData.residenceStatus === '' ? (
                        <>
                          在留カードの<strong>「在留資格」</strong>の欄を見てください
                          <Image src="/Images/front-2.jpg" alt="在留カード" width={500} height={300} className="mx-auto mt-1 rounded-lg" />
                        </>
                      ) : formData.workRestriction !== '就労制限なし' ? (
                        <>
                          在留カード裏面の<strong>「資格外活動許可」</strong>の欄を見てください
                          <Image src="/Images/back.jpg" alt="在留カード" width={500} height={300} className="mx-auto mt-1 rounded-lg" />
                        </>
                      ) : (
                        <>
                          在留カードの<strong>「在留資格」</strong>の欄を見てください
                          <Image src="/Images/front-2.jpg" alt="在留カード" width={500} height={300} className="mx-auto mt-1 rounded-lg" />
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workRestriction" className="text-lg  text-gray-700">就労制限の有無</Label>
                      <Select 
                        value={formData.workRestriction}
                        onValueChange={(value) => {
                          updateFormData('workRestriction', value)
                          updateFormData('residenceStatus', '')
                          setCheckboxStates(initialCheckboxStates)
                        }}
                      >
                        <SelectTrigger id="workRestriction" className="text-lg p-3 border border-gray-300 rounded-md">
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(residenceStatuses).map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.workRestriction && (
                      <div className="space-y-2">
                        <Label htmlFor="residenceStatus" className="text-lg  text-gray-700">在留資格</Label>
                        <Select 
                          value={formData.residenceStatus}
                          onValueChange={(value) => {
                            updateFormData('residenceStatus', value)
                            setCheckboxStates(initialCheckboxStates)
                          }}
                        >
                          <SelectTrigger id="residenceStatus" className="text-lg p-3 border border-gray-300 rounded-md">
                            <SelectValue placeholder="選択してください" />
                          </SelectTrigger>
                          <SelectContent>
                            {residenceStatuses[formData.workRestriction as keyof typeof residenceStatuses].map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className='pt-2'>
                      {formData.residenceStatus && renderResidenceStatusInfo()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      setStep(1)
                    }} 
                    className="flex items-center space-x-2 px-6 py-3 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>戻る</span>
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      setStep(3)
                    }}
                    className="flex items-center space-x-2 px-6 py-3 text-lg bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!formData.workRestriction || !formData.residenceStatus || !areAllCheckboxesChecked()}
                  >
                    <span>次へ</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3  && (
              <motion.div
                key="step3"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className='max-w-[600px] mx-auto'
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-lg font-medium text-gray-700">氏名</Label>
                    <Input 
                      id="name" 
                      placeholder="例: 山田太郎" 
                      autoComplete="off" 
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="text-lg p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-lg font-medium text-gray-700">住所</Label>
                    <Input 
                      id="address" 
                      placeholder="例: 東京都渋谷区渋谷1-1-1" 
                      autoComplete="off"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="text-lg p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lg font-medium text-gray-700">電話番号</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      placeholder="例: 09012345678" 
                      autoComplete="off"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="text-lg p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <MoreVertical className="h-5 w-5 mx-auto mt-2 text-gray-400" />
                    <p className="mt-2 text-gray-500 text-center">その他必要な情報</p>
                    {formData.nationality === 'foreign' && (
                     <MoreVertical className="h-5 w-5 mx-auto mt-2 text-gray-400" />
                    )}
                  </div>

                </div>
                  {formData.nationality === 'foreign' && (
                    <div className="space-y-2 mt-1">
                      <Label htmlFor="countryOfOrigin" className="text-lg font-medium text-gray-700">国籍</Label>
                      <Select 
                        value={formData.countryOfOrigin}
                        onValueChange={(value) => updateFormData('countryOfOrigin', value)}
                      >
                        <SelectTrigger id="countryOfOrigin" className="text-lg p-3 border border-gray-300 rounded-md">
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      if (formData.nationality === 'japanese' ) {
                        setStep(1)
                      } else {
                        setStep(2)
                      }
                    }}
                    className="flex items-center space-x-2 px-6 py-3 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>戻る</span>
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      setStep(4)
                    }}
                    disabled={
                      !formData.name || 
                      !formData.address || 
                      !formData.phone || 
                      (formData.nationality === 'foreign' && !formData.countryOfOrigin)
                    }
                    className="flex items-center space-x-2 px-6 py-3 text-lg bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <span>次へ</span>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className='max-w-[600px] mx-auto'
              >
                <div className="space-y-4">
                  <Alert className="bg-green-50 border border-green-200 text-green-700">
                    <AlertDescription className="text-green-700 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 inline-block mb-1 mr-1" />
                      登録内容を確認してください。
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2 ml-1">
                    <p className="text-lg text-gray-700"><strong>氏名:</strong> {formData.name}</p>
                    <p className="text-lg text-gray-700"><strong>住所:</strong> {formData.address}</p>
                    <p className="text-lg text-gray-700"><strong>電話番号:</strong> {formData.phone}</p>
                    <div className="flex flex-col items-center">
                      <MoreVertical className="h-5 w-5 mx-auto mt-2 text-gray-400" />
                      <p className="mt-2 text-gray-500 text-center">その他必要な情報</p>
                    </div>
                    {formData.nationality === 'foreign' && (
                      <>
                        <MoreVertical className="h-5 w-5 mx-auto mt-2 text-gray-400" />
                        <p className="text-lg text-gray-700 mt-2"><strong>国籍:</strong> {formData.countryOfOrigin}</p>
                        <p className="text-lg text-gray-700"><strong>在留資格:</strong> {formData.residenceStatus}</p>
                        {formData.workHours && <p className="text-lg text-gray-700"><strong>週の勤務時間:</strong> {formData.workHours}時間</p>}
                        {formData.jobType && <p className="text-lg text-gray-700"><strong>従事予定の業務:</strong> {formData.jobType}</p>}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <Button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault()
                      setStep(3)
                    }} 
                    className="flex items-center space-x-2 px-6 py-3 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>戻る</span>
                  </Button>
                  
                  <Button 
                    type="submit"
                    className="px-6 py-3 text-lg bg-blue-500 text-white rounded-md hover:bg-blue-700"
                    onClick={() => alert("実際はデータベースに情報を登録する処理をします")}
                  >
                    登録
                  </Button>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}