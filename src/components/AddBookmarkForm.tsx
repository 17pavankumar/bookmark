
"use client"

import { useState } from "react"
import { createClient } from "../lib/supabase/client"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Plus, Loader2 } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { toast } from "react-hot-toast"

import { useRouter } from "next/navigation"

export default function AddBookmarkForm({ user }: { user: User }) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("bookmarks")
        .insert({
          title,
          url,
          user_id: user.id
        })

      if (error) throw error

      setTitle("")
      setUrl("")
      toast.success("Bookmark added!")
      router.refresh() // <--- Force server refresh
    } catch (error: any) {
      toast.error(`Error adding bookmark: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl">
      <div className="flex-1">
        <Input
          placeholder="Bookmark Title (e.g., My Portfolio)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-white/10 focus:bg-white/10 text-white placeholder:text-gray-400"
        />
      </div>
      <div className="flex-[2]">
        <Input
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          className="bg-transparent border-white/10 focus:bg-white/10 text-white placeholder:text-gray-400"
        />
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 rounded-xl"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Add
      </Button>
    </form>
  )
}
