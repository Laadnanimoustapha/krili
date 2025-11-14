"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Grid, List, Star, MapPin, Map, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MapSearch } from "./map-search"
import { useToast } from "@/hooks/use-toast"

interface Item {
  id: number
  title: string
  description: string
  daily_rental_price: number
  rating?: number
  total_reviews?: number
  location?: string
  city?: string
  category_name?: string
  condition?: string
  first_name?: string
  last_name?: string
  primary_image?: string
  listing_status?: string
}

const mockItems: Item[] = [
  {
    id: 1,
    title: "Professional Camera Bundle",
    description: "Complete photography kit with lenses and tripod",
    daily_rental_price: 150,
    rating: 4.8,
    total_reviews: 24,
    city: "San Francisco, CA",
    category_name: "Electronics",
    condition: "Like New",
    first_name: "Alex",
    last_name: "Johnson",
    primary_image: "/placeholder.svg?height=300&width=400",
    listing_status: "active",
  },
  {
    id: 2,
    title: "Electric Drill Set",
    description: "Cordless power drill with multiple bits",
    daily_rental_price: 35,
    rating: 4.5,
    total_reviews: 18,
    city: "San Francisco, CA",
    category_name: "Tools",
    condition: "Good",
    first_name: "Mike",
    last_name: "Smith",
    primary_image: "/placeholder.svg?height=300&width=400",
    listing_status: "active",
  },
  {
    id: 3,
    title: "Mountain Bike",
    description: "26-inch mountain bike perfect for trails",
    daily_rental_price: 45,
    rating: 4.6,
    total_reviews: 31,
    city: "San Francisco, CA",
    category_name: "Sports Equipment",
    condition: "Good",
    first_name: "Sarah",
    last_name: "Davis",
    primary_image: "/placeholder.svg?height=300&width=400",
    listing_status: "active",
  },
]

export function SearchResults() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [items, setItems] = useState<Item[]>(mockItems)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages] = useState(1)

  // Filter items based on search query
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      if (searchQuery) {
        const filtered = mockItems.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setItems(filtered)
      } else {
        setItems(mockItems)
      }
      setIsLoading(false)
    }, 500)
  }, [searchQuery])

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.daily_rental_price - b.daily_rental_price
      case "price-high":
        return b.daily_rental_price - a.daily_rental_price
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">{items.length} items found</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none border-r"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none border-r"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="rounded-none"
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
          className="pl-10"
        />
      </div>

      {viewMode === "map" ? (
        <MapSearch />
      ) : (
        <>
          {/* Results Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found. Try adjusting your search.</p>
            </div>
          ) : (
            <>
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
              >
                {sortedItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={viewMode === "list" ? "flex" : ""}>
                      {/* Image */}
                      <div className={viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[4/3] relative"}>
                        <Image
                          src={item.primary_image || "/placeholder.svg?height=300&width=400&query=rental item"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        {item.listing_status !== "active" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Not Available</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold">{item.daily_rental_price} DH</p>
                              <p className="text-xs text-muted-foreground">per day</p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{item.rating}</span>
                                <span>({item.total_reviews || 0})</span>
                              </div>
                            )}
                            {item.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{item.city}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex gap-2">
                              {item.category_name && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category_name}
                                </Badge>
                              )}
                              {item.condition && (
                                <Badge variant="outline" className="text-xs">
                                  {item.condition}
                                </Badge>
                              )}
                            </div>

                            <Button size="sm" asChild disabled={item.listing_status !== "active"}>
                              <Link href={`/item/${item.id}`}>
                                {item.listing_status === "active" ? "View Details" : "Unavailable"}
                              </Link>
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                              {item.first_name?.charAt(0) || "U"}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              by {item.first_name} {item.last_name}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-8">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <Button key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
