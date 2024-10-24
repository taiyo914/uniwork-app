"use client";
import { useEffect, useState } from "react";
import {
  Home,
  DollarSign,
  MessageCircle,
  Users,
  User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function VerticalNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: <Home className="h-6 w-6" />, label: "Home", href: "/employee" },
    { icon: <DollarSign className="h-6 w-6" />, label: "Payroll", href: "/employee/payroll" },
    { icon: <MessageCircle className="h-6 w-6" />, label: "Chat", href: "/employee/chat" },
    { icon: <Users className="h-6 w-6" />, label: "Members", href: "/employee/members" },
    { icon: <User className="h-6 w-6" />, label: "Profile", href: "/employee/profile" },
  ];

  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <nav
      className={`p-2 fixed top-0 left-0 h-full border-r-[2px] bg-gray-50 transition-all duration-200 ease-in-out z-20 ${
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
    </nav>
  );
}
