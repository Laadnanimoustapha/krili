"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Trash2,
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  Search,
  Grid3X3,
  List,
} from "lucide-react"

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const wishlistItems = [
    {
      id: "1",
      title: "Professional DSLR Camera",
      description: "Canon EOS R5 with 24-70mm lens",
      price: 89.99,
      period: "per day",
      image: "/professional-camera.png",
      location: "New York, NY",
      rating: 4.9,
      reviews: 127,
      owner: "Sarah Johnson",
      availability: "Available",
      category: "Electronics",
      addedDate: "2024-01-10",
    },
    {
      id: "2",
      title: "Mountain Bike - Trek",
      description: "High-performance mountain bike for trails",
      price: 45.0,
      period: "per day",
      image: "/mountain-bike-trek.png",
      location: "San Francisco, CA",
      rating: 4.8,
      reviews: 89,
      owner: "Mike Chen",
      availability: "Available",
      category: "Sports",
      addedDate: "2024-01-08",
    },
    {
      id: "3",
      title: "Camping Tent - 4 Person",
      description: "Waterproof family camping tent",
      price: 25.0,
      period: "per day",
      image: "/camping-tent.png",
      location: "Denver, CO",
      rating: 4.7,
      reviews: 156,
      owner: "Alex Rivera",
      availability: "Rented until Jan 20",
      category: "Outdoor",
      addedDate: "2024-01-05",
    },
  ]

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const removeFromWishlist = (itemId: string) => {
    // Remove item logic here
    console.log("Removing item:", itemId)
  }

  const totalSelectedValue = wishlistItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">Items you've saved for later</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Items ({wishlistItems.length})</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search wishlist..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            {selectedItems.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedItems.length} items selected</p>
                      <p className="text-sm text-muted-foreground">Total value: ${totalSelectedValue.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
                        Clear Selection
                      </Button>
                      <Button size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Rent Selected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {wishlistItems.map((item) => (
                <Card
                  key={item.id}
                  className={`group hover:shadow-lg transition-all duration-300 ${
                    selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
                  } ${viewMode === "list" ? "flex-row" : ""}`}
                >
                  <div className={viewMode === "list" ? "flex w-full" : ""}>
                    <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"}`}>
                      <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                        <span className="text-muted-foreground">Image</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant={item.availability === "Available" ? "default" : "secondary"}>
                          {item.availability}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="h-4 w-4"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background text-red-500 hover:text-red-600"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                          <span>({item.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-primary">${item.price}</span>
                          <span className="text-sm text-muted-foreground ml-1">{item.period}</span>
                        </div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        Added on {new Date(item.addedDate).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" disabled={item.availability !== "Available"}>
                          <Calendar className="h-4 w-4 mr-2" />
                          {item.availability === "Available" ? "Rent Now" : "Unavailable"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {wishlistItems.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Start browsing and save items you're interested in renting
                  </p>
                  <Button asChild>
                    <a href="/browse">Browse Items</a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="available">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {wishlistItems
                .filter((item) => item.availability === "Available")
                .map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                    {/* Same card content as above */}
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="unavailable">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {wishlistItems
                .filter((item) => item.availability !== "Available")
                .map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 opacity-75">
                    {/* Same card content as above */}
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your wishlist efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start bg-transparent">
                <DollarSign className="h-4 w-4 mr-2" />
                Pay for All Available Items
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                <Heart className="h-4 w-4 mr-2" />
                Share Wishlist
              </Button>
              <Button variant="outline" className="justify-start bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Wishlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
