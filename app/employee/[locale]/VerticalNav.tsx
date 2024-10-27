"use client";
import { useEffect, useState } from "react";
import {
  Home,
  Clock,
  MessageCircle,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";
import { useTranslation } from 'react-i18next';

export default function VerticalNav() {
  const { t:translate } = useTranslation();
  const t = (key: string) => translate(`nav.${key}`);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const handleLogout = useLogout();
  const {locale} =  useParams()

  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: t("home"), href: `/employee/${locale}` },
    { icon: <Clock className="h-6 w-6" />, label: t("timelog"), href: `/employee/${locale}/timelog` },
    { icon: <MessageCircle className="h-6 w-6" />, label: t("chat"), href: `/employee/${locale}/chat` },
    { icon: <Users className="h-6 w-6" />, label: t("members"), href: `/employee/${locale}/members` },
    { icon: <User className="h-6 w-6" />, label: t("profile"), href: `/employee/${locale}/profile` },
  ];

  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <nav
      className={`px-2 fixed top-0 left-0 h-full border-r-[2px] bg-gray-50 transition-all duration-200 ease-in-out z-20 flex flex-col justify-between ${
        isExpanded ? "w-48" : "w-16"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul className="py-2 space-y-1">
        {navItems.map((item, index) => (
          <li key={index} className="relative">
            <Link
              href={item.href}
              className={`flex items-center p-3 transition-all ease-in-out rounded-lg
                ${pathname !== item.href && "hover:bg-gray-200"}
              `}
            >
              <div className="mr-4">
                {item.icon}
                {pathname === item.href && (
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
        ))}
      </ul>
      <div className="py-2 border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="flex w-full items-center p-3 transition-all duration-300 ease-in-out hover:bg-gray-200 rounded-lg"
        >
          <span className="relative mr-3">
            <LogOut className="h-6 w-6 text-gray-600" />
          </span>
          <span
            className={`whitespace-nowrap transition-all duration-200 overflow-hidden ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {t("logout")}
          </span>
        </button>
      </div>
    </nav>
  );
}
