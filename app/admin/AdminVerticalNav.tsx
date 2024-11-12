"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Users, User, LogOut, Earth, LayoutPanelLeft, UserPlus} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";

export default function AdminVerticalNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const handleLogout = useLogout();

  const navItems = [
    { icon: <LayoutPanelLeft className="h-6 w-6" />, label: "ダッシュボード", href: "/admin" },
    { icon: <UserPlus className="h-6 w-6" />, label: "従業員登録", href: "/admin/new-employee" },
    { icon: <MessageCircle className="h-6 w-6" />, label: "チャット", href: "/admin/chat" },
    { icon: <Users className="h-6 w-6" />, label: "メンバー", href: "/admin/members" },
    { icon: <User className="h-6 w-6" />, label: "プロフィール", href: "/admin/profile" },
  ];

  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <nav
      className={`xs:hidden px-2 fixed top-0 left-0 h-full border-r-[2px] bg-gray-50 transition-all duration-200 ease-in-out z-20 flex flex-col justify-between ${
         isExpanded ? "w-64" : "sm:w-16 w-14"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul className="py-2 space-y-1 short:space-y-0 short:py-0">
        <li className="relative">
          <div
            className={`flex items-center sm:p-3 p-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600`}
          >
            <div className="mr-3 sm:-ml-0.5">
              <Earth className="sm:h-7 sm:w-7 h-6 w-6 text-blue-600" />
            </div>
            <div
              className={`whitespace-nowrap overflow-hidden text-2xl font-semibold `}
            >
              Uniwork <span className="text-xs text-gray-600">for Admin</span>
            </div>
          </div>
        </li>
        {navItems.map((item, index) => { 
          const isActive =
          item.href === "/admin"
            ? pathname === item.href          // ホームアイコンは完全一致
            : pathname.startsWith(item.href); // 他のアイコンは前方一致
          return (
            <li key={index} className="relative">
              <Link
                href={item.href}
                className={`flex items-center sm:p-3 p-2 transition-all ease-in-out rounded-lg
                  ${!isActive && "hover:bg-gray-200"}
                `}
              >
                <div className="mr-4 mb-1 sm:mb-0">
                  <div className="sm:h-6 sm:w-6 h-5 w-5 ">
                    {item.icon}
                  </div>
                  {isActive && (
                    <span className="absolute inset-0 bg-gray-600 opacity-20  rounded-lg"></span>
                  )}
                </div>
                <div
                  className={`whitespace-nowrap transition-all duration-100 overflow-hidden ${
                    isExpanded ? "opacity-100" : "opacity-50"
                  }`}
                >
                  {item.label}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="sm:py-2 py-1 border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="flex w-full items-center sm:p-3 p-2 transition-all duration-300 ease-in-out hover:bg-gray-200 rounded-lg"
        >
          <span className="relative mr-4 mb-0.5 sm:mb-0">
            <LogOut className="sm:h-6 sm:w-6 h-5 w-5 text-gray-600" />
          </span>
          <span
            className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            ログアウト
          </span>
        </button>
      </div>
    </nav>
  );
}
