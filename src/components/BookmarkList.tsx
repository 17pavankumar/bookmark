
"use client"

import { Bookmark } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BookmarkList({ bookmarks, onDelete }: { bookmarks: Bookmark[], onDelete: (id: string) => void }) {
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
            <div className="absolute top-4 right-4 z-20">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(bookmark.id)}
                className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardTitle className="pr-8 truncate text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {bookmark.title}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              added {new Date(bookmark.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                timeZone: 'UTC'
              })}
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
