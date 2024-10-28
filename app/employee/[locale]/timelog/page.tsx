"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlayCircle, StopCircle, AlarmClock, Coffee, Clock, LogIn, LogOut } from "lucide-react"

type WorkStatus = 'notStarted' | 'working' | 'onBreak'
type AttendanceRecord = {
  action: string;
  time: string;
  date: string;
}

export default function AttendanceApp() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [workStatus, setWorkStatus] = useState<WorkStatus>('notStarted')

  const handleTimeRecord = (action: string) => {
    let recordAction = action;
    if (action === "勤務開始" && workStatus !== 'notStarted') {
      recordAction = "勤務中";
    } else if (action === "休憩開始" && workStatus === 'onBreak') {
      recordAction = "休憩中";
    }

    const now = new Date()
    const newRecord = {
      action: recordAction,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString()
    }
    setRecords([newRecord, ...records])

    switch (action) {
      case "勤務開始":
        setWorkStatus('working')
        break
      case "勤務終了":
        setWorkStatus('notStarted')
        break
      case "休憩開始":
        setWorkStatus('onBreak')
        break
      case "休憩終了":
        setWorkStatus('working')
        break
    }
  }

  const getButtonStyle = (buttonType: string): string => {
    const baseStyle = "h-28 text-xl rounded-xl transition-all duration-300 ease-in-out flex items-center justify-center"
    const activeStyle = "hover:scale-[1.01] hover:shadow-lg shadow-md"
    const disabledStyle = "opacity-50 cursor-not-allowed"
  
    switch (buttonType) {
      case "勤務開始":
        if (workStatus === 'notStarted') {
          return `${baseStyle} ${activeStyle} bg-blue-100 text-blue-700 hover:bg-blue-200 `
        }
        return `${baseStyle} ${disabledStyle} bg-blue-200 text-gray-500` 
      case "勤務終了":
        if (workStatus === 'working') {
          return `${baseStyle} ${activeStyle} bg-red-200 text-red-700 hover:bg-red-300 `
        }
        return `${baseStyle} ${disabledStyle} bg-gray-200 text-gray-500`
      case "休憩開始":
        if (workStatus === 'working') {
          return `${baseStyle} ${activeStyle} bg-green-200 text-emerald-700 hover:bg-green-300`
        }
        if (workStatus === 'onBreak') {
          return `${baseStyle} ${disabledStyle} bg-green-300 text-gray-500` 
        }
        return `${baseStyle} ${disabledStyle} bg-gray-200 text-gray-500`
      case "休憩終了":
        if (workStatus === 'onBreak') {
          return `${baseStyle} ${activeStyle} bg-orange-200 text-orange-700 hover:bg-orange-300`
        }
        return `${baseStyle} ${disabledStyle} bg-gray-200 text-gray-500`
      default:
        return baseStyle
    }
  }

  const getButtonIcon = (buttonType: string) => {
    switch (buttonType) {
      case "勤務開始":
        return workStatus === 'notStarted' ? <LogIn/> : <Clock />
      case "勤務終了":
        return <LogOut />
      case "休憩開始":
        return workStatus === 'onBreak' ?  <Coffee /> : <PlayCircle/> 
      case "休憩終了":
        return <StopCircle />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto w-full ">
        <h1 className="text-4xl font-bold mb-8 mt-4 text-center text-blue-700">
          勤怠管理アプリ
        </h1>
        
        <div className="space-y-8 ">
          <div className="">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <button 
                onClick={() => handleTimeRecord("勤務開始")} 
                className={getButtonStyle("勤務開始")}
                disabled={workStatus !== 'notStarted'}
              >
                <div className="flex items-center justify-center w-full gap-1">
                  {getButtonIcon("勤務開始")}
                  <span >{workStatus === 'notStarted' ? "勤務開始" : "勤務中"}</span>
                </div>
              </button>
              <button 
                onClick={() => handleTimeRecord("勤務終了")} 
                className={getButtonStyle("勤務終了")}
                disabled={workStatus !== 'working'}
              >
                <div className="flex items-center justify-center w-full gap-1">
                  {getButtonIcon("勤務終了")}
                  <span >勤務終了</span>
                </div>
              </button>
              <button 
                onClick={() => handleTimeRecord("休憩開始")} 
                className={getButtonStyle("休憩開始")}
                disabled={workStatus !== 'working'}
              >
                <div className="flex items-center justify-center w-full gap-1">
                  {getButtonIcon("休憩開始")}
                  <span className="ml-1">{workStatus === 'onBreak' ? "休憩中" : "休憩開始"}</span>
                </div>
              </button>
              <button 
                onClick={() => handleTimeRecord("休憩終了")} 
                className={getButtonStyle("休憩終了")}
                disabled={workStatus !== 'onBreak'}
              >
                <div className="flex items-center justify-center w-full gap-1">
                  {getButtonIcon("休憩終了")}
                  <span>休憩終了</span>
                </div>
              </button>
            </div>
            
            <button 
              onClick={() => alert("時間指定機能はまだ実装されていません")} 
              className="w-full h-20 text-lg bg-gray-200 hover:bg-gray-300 text-blue-700 rounded-xl shadow-md transition-all duration-300 ease-in-out hover:scale-[1.01] flex items-center justify-center"
            >
              <div className="flex items-center justify-center w-full gap-1">
                <AlarmClock className="mb-0.5" />
                <span>時間を指定して入力</span>
              </div>
            </button>
          </div>
          
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-100">
              <CardTitle className="text-2xl  text-blue-700">打刻履歴</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-650px)] min-h-[500px]">
                {records.map((record, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-blue-200 transition-all duration-300 ease-in-out hover:shadow-md">
                    <p className="font-semibold text-lg text-blue-700">{record.action}</p>
                    <p className="text-sm text-gray-600">{record.date} {record.time}</p>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}