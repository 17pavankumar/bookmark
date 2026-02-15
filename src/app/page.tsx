
import { createClient } from "../lib/supabase/server"
import Dashboard from "@/components/Dashboard"
import AuthButton from "@/components/AuthButton"
import { Bookmark } from "@/types"
import { Sparkles, Zap, Lock, LogIn } from "lucide-react"

// Force dynamic rendering to prevent caching of authentication state
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialBookmarks: Bookmark[] = []
  if (user) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) initialBookmarks = data as Bookmark[]
  }

  // If NOT logged in: Full screen Hero landing
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          <div className="relative z-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <Sparkles className="w-16 h-16 text-blue-300 drop-shadow-md" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 drop-shadow-2xl">
          Smart <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">Bookmarks</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
          Organize your digital life with a beautiful, real-time bookmark manager. 
          <br className="hidden md:block"/>Private, fast, and synced across all your devices.
        </p>
        
        <div className="transform hover:scale-105 transition-transform duration-300">
           <AuthButton initialUser={null} layout="landing" />
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full px-4">
          <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors group">
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Sync</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Changes updates instantly across all your open tabs and devices without refreshing.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors group">
            <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Private & Secure</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Your bookmarks are encrypted and only accessible by you via Google Auth.</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/5 hover:border-white/10 transition-colors group">
             <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
              <LogIn className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">One-Click Login</h3>
            <p className="text-slate-400 text-sm leading-relaxed">No passwords to remember. Sign up and log in securely using your Google account.</p>
          </div>
        </div>
      </main>
    )
  }

  // If Logged In: Dashboard
  return (
    <main className="flex min-h-screen flex-col w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
      <header className="flex justify-between items-center mb-10 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white hidden sm:block tracking-tight">
            Smart Bookmarks
          </h1>
        </div>
        <AuthButton initialUser={user} layout="dashboard" />
      </header>

      <div className="w-full max-w-5xl mx-auto flex-1">
        <Dashboard initialBookmarks={initialBookmarks} user={user} />
      </div>
    </main>
  )
}
