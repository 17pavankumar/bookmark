
'use client'

import { createClient } from "../lib/supabase/client"
import { Button } from "./ui/button"
import { LogOut, Mail, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function AuthButton({ 
  initialUser,
  layout 
}: { 
  initialUser: User | null,
  layout: 'landing' | 'dashboard'
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Sync local state if prop changes
    setUser(initialUser)
  }, [initialUser])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user ?? null
      
      // If the user state changed drastically from what we know
      if (user?.id !== newUser?.id) {
        setUser(newUser)

        if (!newUser && initialUser) {
           setIsTransitioning(true)
           router.refresh()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, initialUser, user?.id, router])

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setMessage("")
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
      setGoogleLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setMessage("")
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setMessage("Check your email for the login link!")
      setEmail("")
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsTransitioning(true)
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone and all your bookmarks will be lost.")) {
      return
    }

    setIsTransitioning(true)
    
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      
      await supabase.auth.signOut()
      setUser(null)
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting account:', error)
      const errorMsg = error.message || JSON.stringify(error) || "Unknown error"
      
      if (errorMsg.includes('does not exist') || errorMsg.includes('delete_user')) {
        setMessage("Error: The delete function is missing. Please run the FIX_DELETE_USER.sql script in Supabase.")
        alert("Action Required: Please run the 'FIX_DELETE_USER.sql' script in your Supabase SQL Editor to enable account deletion.")
      } else {
        setMessage(`Error deleting account: ${errorMsg}`)
      }
      setIsTransitioning(false)
    }
  }

  // Show loading state during transitions
  if (isTransitioning) {
    return (
      <div className="flex items-center gap-4 min-h-[40px]">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-8 w-8 bg-white/10 rounded-full"></div>
          <div className="h-4 w-24 bg-white/10 rounded hidden sm:block"></div>
        </div>
      </div>
    )
  }

  // --- DASHBOARD LAYOUT LOGIC ---
  if (layout === 'dashboard' && user) {
    return (
      <div className="flex items-center gap-4">

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDeleteAccount}
          className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium rounded-full mr-2"
          title="Delete Account"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-semibold rounded-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    )
  }

  // --- LANDING LAYOUT LOGIC ---
  if (layout === 'landing') {
    return (
      <div className="flex flex-col gap-4 items-center">
        {/* Google Sign In Button */}
        <Button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="gap-3 bg-white hover:bg-gray-100 text-gray-800 shadow-lg rounded-full font-bold px-8 py-3 transition-all transform hover:scale-[1.02] border border-gray-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-sm text-slate-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Email Sign In Form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-md">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || googleLoading}
          />
          <Button 
            type="submit"
            disabled={loading || googleLoading}
            className="gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 rounded-full font-bold px-6 py-2 transition-all transform hover:scale-[1.02] whitespace-nowrap"
          >
            <Mail className="h-4 w-4" />
            {loading ? "Sending..." : "Sign in with Email"}
          </Button>
        </form>

        {/* Message Display */}
        {message && (
          <p className={`text-sm mt-2 ${message.includes('Error') ? 'text-red-300' : 'text-blue-300'}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  // Fallback: If layout is landing but has user (Client side auth is active)

  return null
}
