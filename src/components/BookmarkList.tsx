
"use client"

import { useEffect, useState } from "react"
import { createClient } from "../lib/supabase/client"
import { Bookmark } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Updated import path
import { Trash2, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { User, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export default function BookmarkList({ initialBookmarks, user }: { initialBookmarks: Bookmark[], user: User }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`, // Filter by user ID for privacy/performance
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
            toast("New bookmark added!")
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
            toast("Bookmark deleted.")
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((prev) => prev.map((b) => (b.id === payload.new.id ? { ...b, ...payload.new } as Bookmark : b)))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  // Handle delete via RPC or just supabase delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
    
    if (error) {
      toast.error("Failed to delete bookmark")
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl font-light">No bookmarks yet. Start collecting!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="group hover:-translate-y-1 transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="relative pb-2">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(bookmark.id)}
                className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="pr-8 truncate text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {bookmark.title}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              added {new Date(bookmark.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-blue-400 truncate hover:underline cursor-pointer" title={bookmark.url}>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                {bookmark.url.replace(/^https?:\/\//, '')}
              </a>
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              asChild 
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"
              variant="outline"
            >
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
