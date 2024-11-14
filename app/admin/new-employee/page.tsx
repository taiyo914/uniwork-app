'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { Checkbox } from "@/components/ui/checkbox"

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const residenceStatuses = {
  "就労制限なし": ["永住者", "日本人の配偶者等", "永住者の配偶者等", "定住者",],
  "在留資格に基づく就労活動のみ可": ["特定技能1号", "技術・人文知識・国際業務", "特定活動（46号）", "技能"],
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
  })

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Form submitted', formData)
    // 実際はデータベースに情報を登録する処理を行う
  }

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault()
    setStep(s => Math.min(s + 1, 3))
  }
  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault()
    setStep(s => Math.max(s - 1, 1))
  }

  const renderResidenceStatusInfo = () => {
    switch (formData.residenceStatus) {
      case "永住者":
      case "日本人の配偶者等":
      case "永住者の配偶者等":
      case "定住者":
        return (
          <Alert className="bg-green-50 border border-green-200 text-green-700 flex">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-1 mt-0.5" />
            <AlertDescription className="text-green-700 text-lg">
              就労制限はなく、日本人と同様に全ての業務に従事可能です。
            </AlertDescription>
          </Alert>
        )
      case "特定技能1号":
        return (
          <>
            <Alert className="bg-blue-50 border border-blue-200 text-blue-700 ">
              <div className="flex items-center gap-1 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mb-0.5" />
                <span className="text-gray-700 text-lg ">以下の項目をチェックしてください</span>
              </div>
              <AlertDescription className="text-blue-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check1" />
                  <label htmlFor="check1">正社員のみ可能でアルバイトでは雇えません。</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check2" />
                  <label htmlFor="check2">週30時間以上のフルタイム勤務が求められます。</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check3" />
                  <label htmlFor="check3">飲食店で働くには外食業技能測定試験の合格が必要です。</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check4" />
                  <label htmlFor="check4">専門領域外の業務では資格外活動許可が必要です。</label>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )
      case "技術・人文知識・国際業務":
        return (
          <>
            <Alert className="bg-blue-50 border border-blue-200 text-blue-700 ">
              <div className="flex items-center gap-1 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mb-0.5" />
                <span className="text-gray-700 text-lg ">以下の項目をチェックしてください</span>
              </div>
              <AlertDescription className="text-blue-700 text-lg">
                <div className="flex items-center gap-2">
                  <Checkbox id="check5" />
                  <label htmlFor="check5">大学や専門学校などで学んだ専門領域の範囲内であれば正社員・アルバイトどちらも可能です。</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check6" />
                  <label htmlFor="check6">調理や接客などの単純労働はできません。</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="check7" />
                  <label htmlFor="check7">専門領域外の業務では資格外活動許可が必要です。</label>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )
      case "特定活動（46号）":
        return (
          <Alert className="bg-blue-50 border border-blue-200 text-blue-700 ">
            <div className="flex items-center gap-1 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目をチェックしてください</span>
            </div>
            <AlertDescription className="text-blue-700 text-lg">
              <div className="flex items-center gap-2">
                <Checkbox id="check8" />
                <label htmlFor="check8">正社員のみ可能でアルバイトでは雇えません。</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check9" />
                <label htmlFor="check9">日本の大学や大学院を卒業し、高度な日本語能力を有する外国人が、専門知識を活かして幅広い業務に従事することを目的としています。</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check10" />
                <label htmlFor="check10">調理や接客などの単純労働はできません。</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check11" />
                <label htmlFor="check11">専門領域外の業務では資格外活動許可が必要です。</label>
              </div>
            </AlertDescription>
          </Alert>
        )
      case "技能":
        return (
          <Alert className="bg-blue-50 border border-blue-200 text-blue-700 ">
            <div className="flex items-center gap-1 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mb-0.5" />
              <span className="text-gray-700 text-lg ">以下の項目をチェックしてください</span>
            </div>
            <AlertDescription className="text-blue-700 text-lg">
              <div className="flex items-center gap-2">
                <Checkbox id="check12" />
                <label htmlFor="check12">正社員のみ可能でアルバイトでは雇えません。</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check13" />
                <label htmlFor="check13">外国料理の調理師として、10年以上の実務経験が必要です。調理以外の業務はできません。</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check14" />
                <label htmlFor="check14">専門領域外の業務では資格外活動許可が必要です。</label>
              </div>
            </AlertDescription>
          </Alert>
        )
      case "留学":
      case "家族滞在":
        return (
          <>
            <Alert className="bg-yellow-50 border border-yellow-200 text-yellow-700 mb-4 flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-1 mt-0.5" />
              <AlertDescription className="text-yellow-700 text-lg">
                アルバイトのみ可能。正社員は不可。<br />
                資格外活動許可を取得すれば、週28時間以内の就労が可能です。
                {formData.residenceStatus === "留学" && "長期休暇中は1日8時間、週40時間まで許可。"}
              </AlertDescription>
            </Alert>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">従業員登録フォーム</h1>
        
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
                    <Label className="text-lg font-medium text-gray-700">国籍選択</Label>
                    <RadioGroup 
                      value={formData.nationality} 
                      onValueChange={(value) => updateFormData('nationality', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="japanese" id="japanese" className="border-gray-400 text-gray-700" />
                        <Label htmlFor="japanese" className="text-lg text-gray-700">日本</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="foreign" id="foreign" className="border-gray-400 text-gray-700" />
                        <Label htmlFor="foreign" className="text-lg text-gray-700">外国籍</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && formData.nationality === 'japanese' && (
              <motion.div
                key="step2"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
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
                    <p className="mt-3 text-gray-500 text-center">その他必要な情報</p>
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
              >
                <div className="space-y-4">
                  <Alert className="bg-gray-100 border border-gray-300 text-gray-700">
                    <AlertDescription className="text-gray-700 text-lg">
                    <AlertCircle className="h-5 w-5 text-gray-600 inline-block mb-1 mr-1" />
                      {formData.workRestriction === '' ? (
                        <>
                          在留カードの「就労制限の有無」の欄を見てください
                          <Image src="/images/front-1.jpg" alt="在留カード" width={600} height={300} className="mx-auto mt-1" />
                        </>
                      ) : formData.residenceStatus === '' ? (
                        <>
                          在留カードの「在留資格」の欄を見てください
                          <Image src="/images/front-2.jpg" alt="在留カード" width={600} height={300} className="mx-auto mt-1" />
                        </>
                      ) : formData.workRestriction !== '就労制限なし' ? (
                        <>
                          在留カード裏面の「資格外活動許可」の欄を見てください
                          <Image src="/images/back.jpg" alt="在留カード" width={600} height={300} className="mx-auto mt-1" />
                        </>
                      ) : (
                        <>
                          在留カードの「在留資格」の欄を見てください
                          <Image src="/images/front-2.jpg" alt="在留カード" width={600} height={300} className="mx-auto mt-1" />
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="workRestriction" className="text-lg font-medium text-gray-700">就労制限の有無</Label>
                    <Select 
                      value={formData.workRestriction}
                      onValueChange={(value) => {
                        updateFormData('workRestriction', value)
                        updateFormData('residenceStatus', '')
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
                      <Label htmlFor="residenceStatus" className="text-lg font-medium text-gray-700">在留資格</Label>
                      <Select 
                        value={formData.residenceStatus}
                        onValueChange={(value) => updateFormData('residenceStatus', value)}
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

                  {formData.residenceStatus && renderResidenceStatusInfo()}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
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
                      <p className="mt-3 text-gray-500 text-center">その他必要な情報</p>
                    </div>
                    {formData.nationality === 'foreign' && (
                      <>
                        <p className="text-lg text-gray-700"><strong>国籍:</strong>外国籍</p>
                        <p className="text-lg text-gray-700"><strong>在留資格:</strong> {formData.residenceStatus}</p>
                        {formData.workHours && <p className="text-lg text-gray-700"><strong>週の勤務時間:</strong> {formData.workHours}時間</p>}
                        {formData.jobType && <p className="text-lg text-gray-700"><strong>従事予定の業務:</strong> {formData.jobType}</p>}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button 
              type="button" 
              onClick={prevStep} 
              disabled={step === 1}
              className="flex items-center space-x-2 px-6 py-3 text-lg bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>戻る</span>
            </Button>
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 text-lg bg-gray-800 text-white rounded-md hover:bg-gray-700"
              >
                <span>次へ</span>
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                type="submit"
                className="px-6 py-3 text-lg bg-gray-800 text-white rounded-md hover:bg-gray-700"
                onClick={() => alert("実際はデータベースに情報を登録する処理をします")}
              >
                登録
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}