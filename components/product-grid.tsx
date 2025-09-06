"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { WishlistButton } from "@/components/wishlist-button"
import { Star, MapPin, MessageCircle, Calendar, Eye } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  title: string
  description: string
  price: number
  period: string
  image: string
  location: string
  rating: number
  reviews: number
  owner: string
  availability: string
  category: string
  isInstantBook?: boolean
}

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <Card
          key={product.id}
          className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 100}ms` }}
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          <div className="relative aspect-video overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
              <span className="text-muted-foreground group-hover:scale-90 transition-transform duration-300">
                Image
              </span>
            </div>

            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-500 ${hoveredProduct === product.id ? "opacity-100" : "opacity-0"}`}
            >
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300 backdrop-blur-sm bg-white/90 hover:bg-white hover:scale-110 shadow-lg"
                  asChild
                >
                  <Link href={`/item/${product.id}`}>
                    <Eye className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform duration-200" />
                    View
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75 backdrop-blur-sm bg-white/90 hover:bg-white hover:scale-110 shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 mr-1 group-hover:bounce transition-transform duration-200" />
                  Chat
                </Button>
              </div>
            </div>

            <div className="absolute top-3 left-3 flex gap-2">
              <Badge
                variant={product.availability === "Available" ? "default" : "secondary"}
                className="animate-in fade-in slide-in-from-left-2 duration-300 backdrop-blur-sm shadow-sm"
              >
                {product.availability}
              </Badge>
              {product.isInstantBook && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/90 text-white border-emerald-500/20 animate-in fade-in slide-in-from-left-2 duration-300 delay-100 backdrop-blur-sm shadow-sm animate-pulse"
                >
                  ⚡ Instant Book
                </Badge>
              )}
            </div>

            <div className="absolute top-3 right-3 animate-in fade-in slide-in-from-right-2 duration-300">
              <WishlistButton itemId={product.id} />
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-all duration-300 line-clamp-1 group-hover:scale-105 origin-left">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors duration-200">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300">
                <div className="flex items-center gap-1 group-hover:scale-105 transition-transform duration-200">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:rotate-12 transition-transform duration-200" />
                  <span className="font-medium">{product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 group-hover:scale-105 transition-transform duration-200">
                  <MapPin className="h-4 w-4 group-hover:bounce transition-transform duration-200" />
                  <span className="truncate">{product.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300 delay-400">
                <div className="group-hover:scale-110 transition-transform duration-300 origin-left">
                  <span className="text-2xl font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                    ${product.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">{product.period}</span>
                </div>
                <Badge variant="outline" className="group-hover:scale-105 transition-transform duration-200">
                  {product.category}
                </Badge>
              </div>

              <div className="flex gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-500">
                <Button
                  className="flex-1 group/btn hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={product.availability !== "Available"}
                  asChild
                >
                  <Link href={`/item/${product.id}`}>
                    <Calendar className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-200" />
                    {product.availability === "Available" ? "Book Now" : "Unavailable"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
