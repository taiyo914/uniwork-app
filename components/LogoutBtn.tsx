"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const LogoutButton: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 border  rounded hover:bg-gray-50"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
