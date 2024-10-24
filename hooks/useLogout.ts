"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      router.push("/login");
    }
  };

  return handleLogout;
};
