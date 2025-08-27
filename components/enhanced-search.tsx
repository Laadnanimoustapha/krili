"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Search, X, Clock, TrendingUp, MapPin } from "lucide-react"

interface SearchSuggestion {
  id: string
  text: string
  type: "recent" | "trending" | "location" | "category"
  count?: number
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function EnhancedSearch({ onSearch, placeholder = "Search...", className }: EnhancedSearchProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])

  const mockSuggestions: SearchSuggestion[] = [
    { id: "1", text: "Camera", type: "recent" },
    { id: "2", text: "Mountain Bike", type: "recent" },
    { id: "3", text: "Power Tools", type: "trending", count: 156 },
    { id: "4", text: "Party Equipment", type: "trending", count: 89 },
    { id: "5", text: "New York, NY", type: "location" },
    { id: "6", text: "Electronics", type: "category" },
  ]

  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        setSuggestions(mockSuggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())))
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions(mockSuggestions.slice(0, 4))
    }
  }, [query])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    onSearch(searchQuery)
    setShowSuggestions(false)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "recent":
        return <Clock className="h-3 w-3" />
      case "trending":
        return <TrendingUp className="h-3 w-3" />
      case "location":
        return <MapPin className="h-3 w-3" />
      default:
        return <Search className="h-3 w-3" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            onClick={() => {
              setQuery("")
              onSearch("")
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors duration-150 text-left"
                onClick={() => handleSearch(suggestion.text)}
              >
                <div className="text-muted-foreground">{getSuggestionIcon(suggestion.type)}</div>
                <span className="flex-1">{suggestion.text}</span>
                {suggestion.count && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {suggestions.length === 0 && query && (
            <div className="p-4 text-center text-sm text-muted-foreground">No suggestions found</div>
          )}
        </div>
      )}

      {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
    </div>
  )
}
