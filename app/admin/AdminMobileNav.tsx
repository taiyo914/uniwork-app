"use client";
import { MessageCircle, Users, User, LogOut, Earth, Menu, X, LayoutPanelLeft, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";
import { useState } from "react";
import { useLockBodyScroll } from "@uidotdev/usehooks";

const Overlay = ({onClose}:{onClose: ()=> void})=>{
  useLockBodyScroll() //結局safariだとどのライブラリでも効かない（Chromeだと効く）
  return <div
    className="fixed inset-0 bg-black opacity-30 z-20"
    onClick={onClose}
  ></div>
}

export default function AdminMobileNav() {
  const pathname = usePathname();
  const handleLogout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { icon: <LayoutPanelLeft className="h-6 w-6" />, label: "ダッシュボード", href: "/admin" },
    { icon: <UserPlus className="h-6 w-6" />, label: "従業員登録", href: "/admin/new-employee" },
    { icon: <MessageCircle className="h-6 w-6" />, label: "チャット", href: "/admin/chat" },
    { icon: <Users className="h-6 w-6" />, label: "メンバー", href: "/admin/members" },
    { icon: <User className="h-6 w-6" />, label: "プロフィール", href: "/admin/profile" },
  ];

  return (
    <div className="hidden xs:block">

      {/* ヘッダー */}
      <header className="h-[3.5rem] fixed top-0 left-0 w-full bg-gray-50 shadow flex justify-between items-center z-20">
        <div className="flex items-center ml-4 py-1.5">
          <Earth className="h-6 w-6 text-blue-500 mb-0.5" />
          <span className="text-[1.6rem] font-semibold ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">Uniwork</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-1 mr-3">
          <Menu className="h-7 w-7 text-gray-500" />
        </button>
      </header>

      {/* スライドナビゲーション */}
      <nav
        className={`fixed top-0 right-0 h-full bg-gray-50 border-r-[2px] transition-transform transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } z-30 w-64 px-2`}
      >

        <div className="flex justify-end">
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 pt-2.5 pr-0.5">
            <X className="h-7 w-7 text-gray-500"/>
          </button>
        </div>
        <ul className="mt-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive =
              item.href === "/admin"
                ? pathname === item.href // ダッシュボードは完全一致
                : pathname.startsWith(item.href); // 他のアイコンは前方一致
            return(
              <li key={index} className="relative">
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2.5">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="absolute bottom-0 left-0 w-full px-2">
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center py-3.5 px-2 transition-all duration-300 ease-in-out hover:bg-gray-200 border-t"
          >
            <span className="mr-3">
              <LogOut className="h-6 w-6 text-gray-600" />
            </span>
            <span>ログアウト</span>
          </button>
        </div>
      </nav>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-50 border-t border-gray-300/80 flex justify-around py-1.5 z-20">
        {navItems.map((item, index) => {
          const isActive =
            item.href === "/admin"
              ? pathname === item.href // ダッシュボードは完全一致
              : pathname.startsWith(item.href); // 他のアイコンは前方一致
          return(
            <Link key={index} href={item.href} className="relative flex flex-col items-center p-2">
              {item.icon}
              {isActive && (
                <span className="absolute inset-0 rounded-lg bg-gray-500 opacity-20"></span>
              )}
            </Link>
          )
        })}
      </nav>

      {isMenuOpen && <Overlay onClose={() => setIsMenuOpen(false)}/>}

    </div>
  );
}

