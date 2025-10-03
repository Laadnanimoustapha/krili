"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Grid, List, Star, MapPin, Map } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MapSearch } from "./map-search"
import { productImages, getProductImage } from "@/lib/product-images"

const mockItems = [
  {
    id: 1,
    title: "Professional DSLR Camera Kit",
    description: "Canon EOS R5 with 24-70mm lens, perfect for photography and videography",
    price: 450,
    rating: 4.9,
    reviews: 127,
    location: "San Francisco, CA",
    category: "Photography",
    condition: "Like New",
    owner: "Salma Benjelloun",
    image: productImages.camera,
    available: true,
    instantBook: true,
  },
  {
    id: 2,
    title: "Power Drill Set with Bits",
    description: "DeWalt 20V MAX cordless drill with complete bit set and carrying case",
    price: 250,
    rating: 4.7,
    reviews: 89,
    location: "Oakland, CA",
    category: "Tools & Equipment",
    condition: "Good",
    owner: "Youssef Bennani",
    image: productImages.powerDrill,
    available: true,
    instantBook: false,
  },
  {
    id: 3,
    title: "Mountain Bike - Trek X-Caliber",
    description: "29-inch mountain bike, perfect for trails and city riding",
    price: 350,
    rating: 4.8,
    reviews: 56,
    location: "Berkeley, CA",
    category: "Sports & Recreation",
    condition: "Good",
    owner: "Amina El Idrissi",
    image: productImages.mountainBike,
    available: false,
    instantBook: true,
  },
  {
    id: 4,
    title: "Gaming Setup - PS5 Console",
    description: "PlayStation 5 with two controllers and popular games included",
    price: 400,
    rating: 4.9,
    reviews: 203,
    location: "San Jose, CA",
    category: "Gaming",
    condition: "Like New",
    owner: "Mehdi Tazi",
    image: productImages.playstation,
    available: true,
    instantBook: true,
  },
  {
    id: 5,
    title: "Pressure Washer - Electric",
    description: "High-pressure electric washer for driveways, decks, and outdoor cleaning",
    price: 300,
    rating: 4.6,
    reviews: 74,
    location: "Fremont, CA",
    category: "Tools & Equipment",
    condition: "Good",
    owner: "Karim Alaoui",
    image: productImages.pressureWasher,
    available: true,
    instantBook: false,
  },
  {
    id: 6,
    title: "Professional Mixer - Yamaha",
    description: "12-channel audio mixer perfect for events and recording",
    price: 550,
    rating: 4.8,
    reviews: 42,
    location: "Palo Alto, CA",
    category: "Music & Audio",
    condition: "Like New",
    owner: "Fatima Zahra",
    image: productImages.mixer,
    available: true,
    instantBook: true,
  },
  {
    id: 7,
    title: "MacBook Pro 16-inch",
    description: "Latest MacBook Pro with M3 chip, perfect for creative work and development",
    price: 800,
    rating: 4.9,
    reviews: 89,
    location: "San Francisco, CA",
    category: "Electronics",
    condition: "Like New",
    owner: "Ahmed Hassan",
    image: productImages.macbook,
    available: true,
    instantBook: true,
  },
  {
    id: 8,
    title: "Electric Guitar - Fender Stratocaster",
    description: "Classic Fender Stratocaster electric guitar with amplifier included",
    price: 180,
    rating: 4.7,
    reviews: 65,
    location: "Berkeley, CA",
    category: "Music & Audio",
    condition: "Good",
    owner: "Maria Rodriguez",
    image: productImages.electricGuitar,
    available: true,
    instantBook: false,
  },
  {
    id: 9,
    title: "Camping Tent - 4 Person",
    description: "Waterproof family camping tent with easy setup, perfect for weekend trips",
    price: 120,
    rating: 4.6,
    reviews: 134,
    location: "Oakland, CA",
    category: "Outdoor",
    condition: "Good",
    owner: "David Chen",
    image: productImages.campingTent,
    available: true,
    instantBook: true,
  },
  {
    id: 10,
    title: "Professional Projector",
    description: "4K projector perfect for presentations, movies, and events",
    price: 320,
    rating: 4.8,
    reviews: 78,
    location: "San Jose, CA",
    category: "Electronics",
    condition: "Like New",
    owner: "Sarah Johnson",
    image: productImages.projector,
    available: true,
    instantBook: true,
  },
  {
    id: 11,
    title: "Electric Scooter",
    description: "High-speed electric scooter with long battery life, perfect for city commuting",
    price: 280,
    rating: 4.5,
    reviews: 92,
    location: "Palo Alto, CA",
    category: "Vehicles",
    condition: "Good",
    owner: "Michael Brown",
    image: productImages.electricScooter,
    available: false,
    instantBook: false,
  },
  {
    id: 12,
    title: "Professional Stand Mixer",
    description: "KitchenAid stand mixer with multiple attachments for all your baking needs",
    price: 95,
    rating: 4.9,
    reviews: 156,
    location: "Fremont, CA",
    category: "Kitchen",
    condition: "Like New",
    owner: "Lisa Wang",
    image: productImages.standMixer,
    available: true,
    instantBook: true,
  },
]

export function SearchResults() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-muted-foreground">{mockItems.length} items found</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="relevance">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
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
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {viewMode === "map" ? (
        <MapSearch />
      ) : (
        <>
          {/* Results Grid/List */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {mockItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className={viewMode === "list" ? "flex" : ""}>
                  {/* Image */}
                  <div className={viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-[4/3] relative"}>
                    <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Not Available</Badge>
                      </div>
                    )}
                    {item.instantBook && item.available && (
                      <Badge className="absolute top-2 left-2 bg-green-600">Instant Book</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold">{item.price} DH</p>
                          <p className="text-xs text-muted-foreground">per day</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                          <span>({item.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.condition}
                          </Badge>
                        </div>

                        <Button size="sm" asChild disabled={!item.available}>
                          <Link href={`/item/${item.id}`}>{item.available ? "View Details" : "Unavailable"}</Link>
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                          {item.owner.charAt(0)}
                        </div>
                        <span className="text-xs text-muted-foreground">by {item.owner}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
