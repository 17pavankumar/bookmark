'use client'

import { useState, useEffect } from "react"
import { User, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { createClient } from "../lib/supabase/client"
import { Bookmark } from "@/types"
import AddBookmarkForm from "./AddBookmarkForm"
import BookmarkList from "./BookmarkList"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function Dashboard({ initialBookmarks, user }: { initialBookmarks: Bookmark[], user: User }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()
  const router = useRouter()

  // Sync with server updates (e.g. after router.refresh())
  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  // Realtime subscription setup
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Bookmark>) => {
          if (payload.eventType === 'INSERT') {
            const newBookmark = payload.new as Bookmark
            setBookmarks((prev) => {
              if (prev.some(b => b.id === newBookmark.id)) return prev
              return [newBookmark, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            // Fix: correctly typed update
            setBookmarks((prev) => prev.map((b) => (b.id === payload.new.id ? { ...b, ...payload.new } as Bookmark : b)))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user.id])

  // Handler for when a user adds a bookmark via the form
  const handleAddBookmark = (newBookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.some(b => b.id === newBookmark.id)) return prev
      return [newBookmark, ...prev]
    })
    router.refresh() // Sync with server for the next thorough fetch
  }

  // Handler for deleting a bookmark
  const handleDeleteBookmark = async (id: string) => {
    // Optimistic update
    const previousBookmarks = [...bookmarks] // Create a copy
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      toast.success("Bookmark deleted")
      router.refresh() // Sync with server
    } catch (error: any) {
      console.error("Delete Error:", error)
      toast.error("Failed to delete bookmark")
      // Rollback
      setBookmarks(previousBookmarks) 
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Your Collection</h2>
        <p className="text-slate-400 font-light">Add, manage, and sync your favorite links.</p>
      </div>

      <AddBookmarkForm user={user} onAdd={handleAddBookmark} />

      <div className="mt-12 pb-20">
        <BookmarkList bookmarks={bookmarks} onDelete={handleDeleteBookmark} />
      </div>
    </div>
  )
}
