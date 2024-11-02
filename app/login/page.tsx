'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { LockIcon, MailIcon, Earth, LogIn } from 'lucide-react'
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { createClient } from '@/utils/supabase/client'

export default function RefinedLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(`Login Error: ${error.message}`);
      return;
    }

    const { user } = data;

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, locale")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        setError(`Role Error: ${profileError.message}`);
        return;
      }

      // ロールに応じてリダイレクト
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push(`/employee/${profile.locale}`);
      }
    }

    setIsLoading(false)
  }

  return (<>
    {isLoading && (<>
      <div className="fixed inset-0 bg-black opacity-40 z-50"></div>
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-2 z-50">
        <Spinner/>
      </div>
    </>)}
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md xs:px-4 mb-20 mt-5">
        <div className='text-5xl font-bold text-center mb-5 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600'><Earth className='inline mb-2 mr-1 text-blue-500' size={40}/>Uniwork</div>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-5">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-md font-medium text-gray-700">
                  email
                </Label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md "
                    placeholder="your@email.com"
                  />
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-md font-medium text-gray-700">
                  password
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md "
                    placeholder="password"
                  />
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <Button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogIn size={18} className='mr-0.5'/>Login
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </>)
}
