"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Shield, Calendar, Edit, Settings, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Mock user data
const mockUser = {
  id: 1,
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  avatar: "/user-avatar.png",
  location: "San Francisco, CA",
  joinDate: "March 2022",
  rating: 4.9,
  totalReviews: 127,
  totalRentals: 89,
  totalListings: 12,
  verified: true,
  kycStatus: "verified",
  bio: "Photography enthusiast and tech lover. I rent out my professional equipment when I'm not using it. Always happy to help fellow creators!",
  responseTime: "Within 2 hours",
  responseRate: "98%",
}

const mockListings = [
  {
    id: 1,
    title: "Professional DSLR Camera Kit",
    price: 45,
    rating: 4.9,
    reviews: 23,
    image: "/professional-camera.png",
    status: "active",
  },
  {
    id: 2,
    title: "Drone with 4K Camera",
    price: 65,
    rating: 4.8,
    reviews: 18,
    image: "/drone-4k-camera.png",
    status: "active",
  },
  {
    id: 3,
    title: "Professional Lighting Kit",
    price: 35,
    rating: 4.7,
    reviews: 12,
    image: "/lighting-kit-professional.png",
    status: "rented",
  },
]

const mockReviews = [
  {
    id: 1,
    reviewer: "Mike Chen",
    rating: 5,
    date: "2 weeks ago",
    comment: "Amazing camera quality! Sarah was super helpful and responsive. The equipment was in perfect condition.",
    item: "Professional DSLR Camera Kit",
  },
  {
    id: 2,
    reviewer: "Emma Davis",
    rating: 5,
    date: "1 month ago",
    comment: "Great experience renting the drone. Clear instructions and fair pricing. Highly recommend!",
    item: "Drone with 4K Camera",
  },
  {
    id: 3,
    reviewer: "Alex Rodriguez",
    rating: 4,
    date: "2 months ago",
    comment: "Good lighting equipment, helped make my video project look professional. Quick pickup process.",
    item: "Professional Lighting Kit",
  },
]

export function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                <AvatarFallback className="text-2xl">{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                {mockUser.kycStatus === "verified" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    KYC Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{mockUser.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mockUser.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {mockUser.joinDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">{mockUser.bio}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{mockUser.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{mockUser.totalReviews} reviews</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{mockUser.totalRentals}</p>
                  <p className="text-sm text-muted-foreground">Rentals</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{mockUser.totalListings}</p>
                  <p className="text-sm text-muted-foreground">Listings</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{mockUser.responseRate}</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">{mockUser.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-medium">{mockUser.responseRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Earnings</span>
                  <span className="font-medium">$2,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium">$340</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Camera kit rented by Mike Chen</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New review received (5 stars)</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Lighting kit returned</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Button asChild>
              <Link href="/list-item">
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <Image src={listing.image || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      listing.status === "active" ? "bg-green-600" : "bg-orange-600"
                    }`}
                  >
                    {listing.status === "active" ? "Available" : "Rented"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{listing.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{listing.rating}</span>
                      <span>({listing.reviews})</span>
                    </div>
                    <span className="font-semibold text-foreground">${listing.price}/day</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{mockUser.rating}</span>
              <span className="text-muted-foreground">({mockUser.totalReviews} reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            {mockReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.reviewer}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-2 leading-relaxed">{review.comment}</p>
                  <Badge variant="outline" className="text-xs">
                    {review.item}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
