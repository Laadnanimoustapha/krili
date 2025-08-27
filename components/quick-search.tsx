"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Clock, TrendingUp } from "lucide-react"

export function QuickSearch() {
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsVisible(true)
      }
      if (e.key === "Escape") {
        setIsVisible(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const recentSearches = ["Camera", "Bike", "Tools"]
  const trendingSearches = ["Party Equipment", "Gaming Setup", "Car"]

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container max-w-2xl mx-auto pt-20">
        <div className="bg-background border rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for anything..."
                className="pl-10 border-0 focus-visible:ring-0 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                Recent searches
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <Button
                    key={search}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-primary/10"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <Button
                    key={search}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:bg-primary/10"
                    onClick={() => setSearchQuery(search)}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-muted/50 text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-background border rounded">Esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  )
}
