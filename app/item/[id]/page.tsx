"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Cpu, HardDrive, Battery, Sun, Moon, ArrowLeft, Heart, Share2, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Sample item data - in a real app, this would come from an API
const itemData = {
  id: 1,
  title: "MacBook Pro 2023",
  price: 500,
  location: "Casablanca, MA",
  description:
    "Brand new MacBook Pro 2023 with M2 Pro chip, 16GB RAM, and 512GB SSD. Perfect for professional work, video editing, and development. Comes with all original accessories and warranty. Available for rent in Casablanca and surrounding areas.",
  images: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
  ],
  features: [
    { icon: Cpu, label: "M2 Pro Chip" },
    { icon: HardDrive, label: "16GB RAM" },
    { icon: HardDrive, label: "512GB SSD" },
    { icon: Battery, label: "18h Battery" },
  ],
  owner: {
    name: "يوسف العلوي",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    rating: 4.9,
    reviews: 120,
    responseRate: "98%",
    avgResponse: "2h",
    totalRentals: "50+",
  },
  category: "Electronics",
  rating: 4.8,
  isAvailable: true,
}

const rentalPeriods = [
  { id: "1day", label: "1 Day", multiplier: 1 },
  { id: "3days", label: "3 Days", multiplier: 3 },
  { id: "1week", label: "1 Week", multiplier: 7 },
  { id: "2weeks", label: "2 Weeks", multiplier: 14 },
  { id: "1month", label: "1 Month", multiplier: 30 },
]

export default function ItemDetailsPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState("1day")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const router = useRouter()

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme as "light" | "dark")
    document.body.setAttribute("data-theme", savedTheme)

    // Check if item is in wishlist
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    setIsWishlisted(wishlist.includes(Number.parseInt(params.id)))
  }, [params.id])

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

  // Handle rental period selection
  const handlePeriodSelect = (periodId: string) => {
    setSelectedPeriod(periodId)
    const period = rentalPeriods.find((p) => p.id === periodId)
    showNotification(`Selected ${period?.label} rental period`, "info")
  }

  // Handle rent item
  const handleRentItem = () => {
    showNotification("Processing rental request...", "info")
    setTimeout(() => {
      showNotification("Rental request sent! Owner will contact you shortly.", "success")
    }, 1500)
  }

  // Handle contact owner
  const handleContactOwner = () => {
    showNotification("Opening chat with owner...", "info")
    setTimeout(() => {
      router.push("/chat")
    }, 1000)
  }

  // Toggle wishlist
  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]")
    const itemId = Number.parseInt(params.id)

    let updatedWishlist
    if (isWishlisted) {
      updatedWishlist = wishlist.filter((id: number) => id !== itemId)
      setIsWishlisted(false)
      showNotification("Removed from wishlist", "success")
    } else {
      updatedWishlist = [...wishlist, itemId]
      setIsWishlisted(true)
      showNotification("Added to wishlist", "success")
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
  }

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: itemData.title,
        text: itemData.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showNotification("Link copied to clipboard", "success")
    }
  }

  // Calculate total price
  const selectedPeriodData = rentalPeriods.find((p) => p.id === selectedPeriod)
  const totalPrice = itemData.price * (selectedPeriodData?.multiplier || 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/white-logo.png" alt="KRILI Logo" width={32} height={32} />
              <span className="font-bold text-xl">KRILI</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="hover:text-primary transition-colors">
              Search
            </Link>
            <Link href="/profile" className="hover:text-primary transition-colors">
              Profile
            </Link>
            <span className="text-primary font-medium">Item</span>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleWishlist}>
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" onClick={toggleTheme} className="gap-2">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="hidden sm:inline">Theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={itemData.images[selectedImage] || "/placeholder.svg"}
                alt={itemData.title}
                fill
                className="object-cover"
                priority
              />
              {!itemData.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Currently Unavailable
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {itemData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${itemData.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Item Information */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{itemData.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{itemData.location}</span>
                  </div>
                </div>
                <Badge variant="secondary">{itemData.category}</Badge>
              </div>

              <div className="text-4xl font-bold text-primary mb-6">{itemData.price} MAD/day</div>

              <p className="text-muted-foreground leading-relaxed">{itemData.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {itemData.features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rental Period Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Rental Period</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {rentalPeriods.map((period) => (
                  <Button
                    key={period.id}
                    variant={selectedPeriod === period.id ? "default" : "outline"}
                    onClick={() => handlePeriodSelect(period.id)}
                    className="h-auto py-3"
                  >
                    <div className="text-center">
                      <div className="font-medium">{period.label}</div>
                      <div className="text-xs opacity-75">{itemData.price * period.multiplier} MAD</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Total Price */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">{totalPrice} MAD</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {itemData.price} MAD × {selectedPeriodData?.multiplier}{" "}
                  {selectedPeriodData?.multiplier === 1 ? "day" : "days"}
                </div>
              </CardContent>
            </Card>

            {/* Rent Button */}
            <Button size="lg" className="w-full text-lg py-6" onClick={handleRentItem} disabled={!itemData.isAvailable}>
              {itemData.isAvailable ? "Rent Now" : "Currently Unavailable"}
            </Button>

            {/* Owner Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={itemData.owner.avatar || "/placeholder.svg"} alt={itemData.owner.name} />
                    <AvatarFallback>{itemData.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-semibold">{itemData.owner.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {itemData.owner.rating} ({itemData.owner.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{itemData.owner.responseRate}</div>
                    <div className="text-sm text-muted-foreground">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{itemData.owner.avgResponse}</div>
                    <div className="text-sm text-muted-foreground">Avg. Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{itemData.owner.totalRentals}</div>
                    <div className="text-sm text-muted-foreground">Rentals</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleContactOwner}>
                  <MessageCircle className="h-4 w-4" />
                  Contact Owner
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
    </div>
  )
}
