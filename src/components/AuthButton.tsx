
'use client'

import { createClient } from "../lib/supabase/client"
import { Button } from "./ui/button"
import { LogOut, LogIn } from "lucide-react"
import { useEffect, useState } from "react"
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function AuthButton({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const supabase = createClient()

  useEffect(() => {
    // If we didn't get an initial user, fetch it? Or rely on props.
    // Actually better to listen to auth state changes to keep UI in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium hidden sm:inline-block text-slate-300">
          {user.email}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-semibold rounded-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleLogin}
      className="gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 rounded-full font-bold px-6 py-2 transition-all transform hover:scale-[1.02]"
    >
      <LogIn className="h-4 w-4" />
      Sign in with Google
    </Button>
  )
}
