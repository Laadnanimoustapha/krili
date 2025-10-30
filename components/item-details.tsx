"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Star, MapPin, Shield, MessageCircle, Heart, Share, CalendarIcon, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { itemsApi, rentalsApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ItemData {
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
  images?: Array<{ image_url: string; is_primary: boolean }>
  reviews?: any[]
  owner_id?: number
  bio?: string
}

export function ItemDetails({ itemId }: { itemId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [item, setItem] = useState<ItemData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isLiked, setIsLiked] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        const response = await itemsApi.getItem(Number.parseInt(itemId))

        if (response.success && response.item) {
          setItem(response.item)
        } else {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive",
          })
          router.push("/browse")
        }
      } catch (error) {
        console.error("Error fetching item:", error)
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        })
        router.push("/browse")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [itemId, toast, router])

  const calculateTotal = () => {
    if (!startDate || !endDate || !item) return 0
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * item.daily_rental_price
  }

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)
    try {
      const response = await rentalsApi.createRental({
        item_id: item!.id,
        rental_start_date: format(startDate, "yyyy-MM-dd"),
        rental_end_date: format(endDate, "yyyy-MM-dd"),
      })

      if (response.success) {
        toast({
          title: "Success",
          description: "Rental booking created successfully",
        })
        router.push("/my-rentals")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!item) {
    return null
  }

  const itemImages = item.images || []
  const primaryImage = itemImages.find((img) => img.is_primary)?.image_url || itemImages[0]?.image_url

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/browse">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
            <Image
              src={primaryImage || "/placeholder.svg?height=400&width=500&query=rental item"}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          {itemImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {itemImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={`${item.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-balance">{item.title}</h1>
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
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating}</span>
                  <span>({item.total_reviews || 0} reviews)</span>
                </div>
              )}
              {item.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.city}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              {item.category_name && <Badge variant="outline">{item.category_name}</Badge>}
              {item.condition && <Badge variant="outline">{item.condition}</Badge>}
            </div>

            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          {/* Owner */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{item.first_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {item.first_name} {item.last_name}
                      </span>
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {item.rating && (
                        <>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                          <span>({item.total_reviews || 0} reviews)</span>
                        </>
                      )}
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
                    {item.daily_rental_price} DH ×{" "}
                    {startDate && endDate
                      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                      : 0}{" "}
                    days
                  </span>
                  <span>{calculateTotal()} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{Math.round(calculateTotal() * 0.1)} DH</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{calculateTotal() + Math.round(calculateTotal() * 0.1)} DH</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                disabled={!startDate || !endDate || isBooking}
                onClick={handleBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Now"
                )}
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
