"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  Map,
  MapPin,
  Star,
  Heart,
  Calendar,
  Eye,
  ArrowUp,
  Sun,
  Moon,
  History,
  Check,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Sample data
const itemsData = [
  {
    id: 1,
    title: "MacBook Pro 2023",
    price: 500,
    rating: 4.8,
    location: "Casablanca",
    date: "2023-10-15",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    tags: ["Electronics", "Laptop", "Apple"],
    description:
      "Brand new MacBook Pro with M2 chip. Perfect for designers, developers, and content creators. Comes with original charger and protective case.",
    features: ["16GB RAM", "1TB SSD", "M2 Chip", "16-inch Display"],
  },
  {
    id: 2,
    title: "Honda CBR 600",
    price: 750,
    rating: 4.5,
    location: "Marrakech",
    date: "2023-09-22",
    category: "vehicles",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
    tags: ["Vehicles", "Motorcycle", "Sport"],
    description:
      "Well-maintained Honda CBR 600. Perfect for city rides and weekend adventures. Includes two helmets and safety gear.",
    features: ["600cc", "Fuel Efficient", "ABS Brakes", "Comfortable Seat"],
  },
  {
    id: 3,
    title: "Sony A7III",
    price: 400,
    rating: 4.7,
    location: "Rabat",
    date: "2023-11-05",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    tags: ["Electronics", "Camera", "Photography"],
    description:
      "Professional full-frame mirrorless camera. Excellent for photography and videography. Comes with 28-70mm lens and accessories.",
    features: ["24.2MP", "4K Video", "Image Stabilization", "Wi-Fi"],
  },
  {
    id: 4,
    title: "4-Person Camping Tent",
    price: 300,
    rating: 4.2,
    location: "Agadir",
    date: "2023-08-30",
    category: "outdoor",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    tags: ["Outdoor", "Camping", "Tent"],
    description:
      "Spacious 4-person camping tent. Waterproof and easy to set up. Perfect for family camping trips and outdoor adventures.",
    features: ["Waterproof", "Easy Setup", "Ventilation", "Storage Pockets"],
  },
  {
    id: 5,
    title: "Professional Drill Set",
    price: 250,
    rating: 4.0,
    location: "Tangier",
    date: "2023-07-18",
    category: "tools",
    image: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=600&q=80",
    tags: ["Tools", "Power Tools", "DIY"],
    description:
      "Complete professional drill set with various bits and accessories. Perfect for home improvement projects and professional use.",
    features: ["Cordless", "Variable Speed", "Battery Included", "Case Included"],
  },
  {
    id: 6,
    title: "Party Equipment Set",
    price: 1000,
    rating: 4.9,
    location: "Fes",
    date: "2023-10-28",
    category: "party",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
    tags: ["Party", "Events", "Complete Set"],
    description:
      "Complete party equipment set including speakers, microphones, lights, and DJ equipment. Perfect for events, weddings, and parties.",
    features: ["Bluetooth Speakers", "Wireless Mics", "LED Lights", "DJ Controller"],
  },
]

interface Filter {
  type: string
  value: string
  displayName: string
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [locationFilter, setLocationFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("0")
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMapView, setShowMapView] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [wishlist, setWishlist] = useState<number[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<(typeof itemsData)[0] | null>(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const savedRecentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
    const savedTheme = localStorage.getItem("theme") || "light"

    setWishlist(savedWishlist)
    setRecentSearches(savedRecentSearches)
    setTheme(savedTheme as "light" | "dark")
    document.body.setAttribute("data-theme", savedTheme)
  }, [])

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const filtered = itemsData.filter((item) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(searchLower)
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesTitle && !matchesTags) return false
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false

      // Price filter
      if (priceRange.min && item.price < Number.parseInt(priceRange.min)) return false
      if (priceRange.max && item.price > Number.parseInt(priceRange.max)) return false

      // Location filter
      if (locationFilter && !item.location.toLowerCase().includes(locationFilter.toLowerCase())) return false

      // Rating filter
      if (Number.parseFloat(ratingFilter) > 0 && item.rating < Number.parseFloat(ratingFilter)) return false

      return true
    })

    // Sort items
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
    }

    return filtered
  }, [searchTerm, selectedCategory, priceRange, locationFilter, ratingFilter, sortBy])

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.body.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    showNotification(`Switched to ${newTheme} theme`, "success")
  }

  // Notification system
  const showNotification = (message: string, type = "info", duration = 3000) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), duration)
  }

  // Add to recent searches
  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      addToRecentSearches(value.trim())
    }
  }

  // Toggle wishlist
  const toggleWishlist = (itemId: number) => {
    const updated = wishlist.includes(itemId) ? wishlist.filter((id) => id !== itemId) : [...wishlist, itemId]
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
    const action = updated.includes(itemId) ? "Added to" : "Removed from"
    showNotification(`${action} wishlist`, "success")
  }

  // Quick view modal
  const openQuickView = (item: (typeof itemsData)[0]) => {
    setSelectedItem(item)
    setShowQuickView(true)
  }

  const closeQuickView = () => {
    setShowQuickView(false)
    setSelectedItem(null)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setPriceRange({ min: "", max: "" })
    setLocationFilter("")
    setRatingFilter("0")
    setActiveFilters([])
    setShowSuggestions(false)
  }

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const categories = [
    { id: "all", label: "All Categories", icon: "🏷️" },
    { id: "electronics", label: "Electronics", icon: "💻" },
    { id: "vehicles", label: "Vehicles", icon: "🚗" },
    { id: "tools", label: "Tools", icon: "🔧" },
    { id: "furniture", label: "Furniture", icon: "🛋️" },
    { id: "outdoor", label: "Outdoor", icon: "🏕️" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.ico" alt="KRILI Logo" width={32} height={32} />
            <span className="font-bold text-xl">KRILI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-primary font-medium">
              Search
            </Link>
            <Link href="/wishlist" className="hover:text-primary transition-colors">
              Wishlist
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleTheme} className="gap-2">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"} Mode</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                JS
              </div>
              <span className="hidden sm:inline">Mohmed</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Rental</h1>
          <p className="text-xl text-muted-foreground">Discover amazing items available for rent in your area</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for items to rent..."
              className="pl-10 pr-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={clearSearch}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50">
              <CardContent className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Recent Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm(search)
                            setShowSuggestions(false)
                          }}
                          className="gap-1"
                        >
                          <History className="h-3 w-3" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {["Laptop", "Camera", "Furniture"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setSearchTerm(suggestion)
                        setShowSuggestions(false)
                      }}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {filter.displayName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setActiveFilters(activeFilters.filter((_, i) => i !== index))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Price Range (MAD/day)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter city"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <span>{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="text-muted-foreground">
            Showing <span className="font-medium">{filteredItems.length}</span> results
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort by Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={() => setShowMapView(!showMapView)} className="gap-2">
              <Map className="h-4 w-4" />
              {showMapView ? "List View" : "Map View"}
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        {!showMapView && (
          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isPopular = item.rating >= 4.5
                const isNew = new Date(item.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                const isPremium = item.price >= 800

                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {isPopular && (
                        <Badge className="absolute top-2 left-2 z-10" variant="secondary">
                          Popular
                        </Badge>
                      )}
                      {isNew && (
                        <Badge className="absolute top-2 left-2 z-10" variant="default">
                          New
                        </Badge>
                      )}
                      {isPremium && (
                        <Badge className="absolute top-2 left-2 z-10" variant="destructive">
                          Premium
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                        onClick={() => toggleWishlist(item.id)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            wishlist.includes(item.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <div className="relative h-48">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      <div className="text-2xl font-bold text-primary mb-2">{item.price} MAD/day</div>

                      <div className="flex items-center gap-1 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}, MA</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2" onClick={() => showNotification("Quick rent clicked", "info")}>
                          <Calendar className="h-4 w-4" />
                          Quick Rent
                        </Button>
                        <Button variant="outline" className="gap-2 bg-transparent" onClick={() => openQuickView(item)}>
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearSearch}>Try Again</Button>
              </div>
            )}
          </div>
        )}

        {/* Map View Placeholder */}
        {showMapView && (
          <Card className="h-96">
            <CardContent className="p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Map View</h3>
                <p className="text-muted-foreground">Interactive map would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Quick View Modal */}
      {showQuickView && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                  onClick={closeQuickView}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="relative h-64">
                  <Image
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={selectedItem.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedItem.rating}</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-2">{selectedItem.price} MAD/day</div>

                <div className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedItem.location}, MA</span>
                </div>

                <p className="text-muted-foreground mb-6">{selectedItem.description}</p>

                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold">Features:</h4>
                  {selectedItem.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 gap-2" onClick={() => showNotification("Rent now clicked", "info")}>
                    <Calendar className="h-4 w-4" />
                    Rent Now
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => toggleWishlist(selectedItem.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${wishlist.includes(selectedItem.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Back to Top Button */}
      {showScrollTop && (
        <Button className="fixed bottom-8 right-8 z-50" size="icon" onClick={scrollToTop}>
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
    </div>
  )
}
