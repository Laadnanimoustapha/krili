"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface WishlistItem {
  id: string
  title: string
  price: number
  location: string
  image: string
  category: string
  rating: number
  available: boolean
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist))
    }
  }, [])

  const removeFromWishlist = (itemId: string) => {
    const updatedWishlist = wishlistItems.filter((item) => item.id !== itemId)
    setWishlistItems(updatedWishlist)
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
  }

  const clearWishlist = () => {
    setWishlistItems([])
    localStorage.removeItem("wishlist")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Wishlist</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start browsing and save items you're interested in renting
            </p>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Items
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                  {!item.available && <Badge className="absolute top-2 left-2 bg-red-500">Unavailable</Badge>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      ${item.price}
                      <span className="text-sm font-normal text-gray-500">/day</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/item/${item.id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={!item.available}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {item.available ? "Rent Now" : "Unavailable"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
