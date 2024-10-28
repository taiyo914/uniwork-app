"use client"
import useAttendanceStore from "@/stores/useAttendanceStore";
import { LogIn, LogOut, PlayCircle, StopCircle, Clock, Coffee } from "lucide-react";

const CurrentTimeButtons = () => {
  const { workStatus, setWorkStatus, addRecord } = useAttendanceStore();

  const handleTimeRecord = (action: string) => {
    const now = new Date();
    const newRecord = {
      action,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
    };
    addRecord(newRecord);

    switch (action) {
      case "勤務開始":
        setWorkStatus('working');
        break;
      case "勤務終了":
        setWorkStatus('notStarted');
        break;
      case "休憩開始":
        setWorkStatus('onBreak');
        break;
      case "休憩終了":
        setWorkStatus('working');
        break;
    }
  };


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
    <div className="grid grid-cols-2 gap-4">
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
  );
};

export default CurrentTimeButtons;
