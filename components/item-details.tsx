"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Star, MapPin, Shield, MessageCircle, Heart, Share, CalendarIcon, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

// Mock item data
const mockItem = {
  id: 1,
  title: "Professional DSLR Camera Kit",
  description:
    "Canon EOS R5 with 24-70mm lens, perfect for photography and videography. Includes battery charger, memory card, and protective case. Great for weddings, events, or personal projects.",
  price: 45,
  rating: 4.9,
  reviews: 127,
  location: "San Francisco, CA",
  category: "Photography",
  condition: "Like New",
  owner: {
    name: "Sarah Johnson",
    rating: 4.8,
    reviews: 89,
    joinDate: "2022",
    verified: true,
  },
  images: ["/professional-camera-front.png", "/professional-camera-side.png", "/camera-accessories.png"],
  features: ["24-70mm Lens", "Battery Charger", "Memory Card", "Protective Case", "Instruction Manual"],
  available: true,
  instantBook: true,
  pickupOptions: ["Owner Delivery", "Meet in Public", "Pickup Location"],
}

export function ItemDetails({ itemId }: { itemId: string }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLiked, setIsLiked] = useState(false)

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * mockItem.price
  }

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/search">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
            <Image
              src={mockItem.images[selectedImage] || "/placeholder.svg"}
              alt={mockItem.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mockItem.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? "border-primary" : "border-transparent"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${mockItem.title} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-balance">{mockItem.title}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsLiked(!isLiked)}>
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{mockItem.rating}</span>
                <span>({mockItem.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{mockItem.location}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Badge variant="outline">{mockItem.category}</Badge>
              <Badge variant="outline">{mockItem.condition}</Badge>
              {mockItem.instantBook && <Badge className="bg-green-600">Instant Book</Badge>}
            </div>

            <p className="text-muted-foreground leading-relaxed">{mockItem.description}</p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">What's Included</h3>
            <ul className="grid grid-cols-2 gap-2">
              {mockItem.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Owner */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{mockItem.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{mockItem.owner.name}</span>
                      {mockItem.owner.verified && <Shield className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{mockItem.owner.rating}</span>
                      <span>({mockItem.owner.reviews} reviews)</span>
                      <span>• Joined {mockItem.owner.joinDate}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Book This Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Select Dates</h4>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {startDate ? format(startDate, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {endDate ? format(endDate, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Pricing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    ${mockItem.price} ×{" "}
                    {startDate && endDate
                      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                      : 0}{" "}
                    days
                  </span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${Math.round(calculateTotal() * 0.1)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal() + Math.round(calculateTotal() * 0.1)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" size="lg" disabled={!startDate || !endDate}>
                {mockItem.instantBook ? "Book Instantly" : "Request to Book"}
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
