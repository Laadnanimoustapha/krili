"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Eye, Trash2, Plus, DollarSign, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

// Mock data for user's listings
const mockListings = [
  {
    id: "1",
    title: "Professional DSLR Camera",
    category: "Photography",
    condition: "Like New",
    dailyPrice: 45,
    location: "San Francisco, CA",
    status: "active",
    views: 127,
    bookings: 3,
    image: "/professional-camera.png",
    createdAt: "2024-01-15",
    availableFrom: "2024-01-20",
    availableTo: "2024-06-20",
  },
  {
    id: "2",
    title: "Mountain Bike - Trail Ready",
    category: "Sports & Recreation",
    condition: "Good",
    dailyPrice: 35,
    location: "San Francisco, CA",
    status: "active",
    views: 89,
    bookings: 2,
    image: "/mountain-bike-trail.png",
    createdAt: "2024-01-10",
    availableFrom: "2024-01-15",
    availableTo: "2024-05-15",
  },
  {
    id: "3",
    title: "Power Drill Set",
    category: "Tools & Equipment",
    condition: "Good",
    dailyPrice: 25,
    location: "San Francisco, CA",
    status: "draft",
    views: 0,
    bookings: 0,
    image: "/power-drill-set.png",
    createdAt: "2024-01-12",
    availableFrom: "2024-01-18",
    availableTo: "2024-04-18",
  },
]

export function MyListings() {
  const [listings] = useState(mockListings)

  const activeListings = listings.filter((listing) => listing.status === "active")
  const draftListings = listings.filter((listing) => listing.status === "draft")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const ListingCard = ({ listing }: { listing: (typeof mockListings)[0] }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img src={listing.image || "/placeholder.svg"} alt={listing.title} className="w-full h-full object-cover" />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}>{listing.status}</Badge>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{listing.category}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />${listing.dailyPrice}/day
            </div>
            <Badge variant="outline">{listing.condition}</Badge>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {listing.location}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Available: {new Date(listing.availableFrom).toLocaleDateString()} -{" "}
            {new Date(listing.availableTo).toLocaleDateString()}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{listing.views} views</span>
            <span className="text-muted-foreground">{listing.bookings} bookings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your rental items</p>
        </div>
        <Button asChild>
          <Link href="/list-item">
            <Plus className="h-4 w-4 mr-2" />
            List New Item
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{activeListings.length}</p>
                <p className="text-sm text-muted-foreground">Active Listings</p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{listings.reduce((sum, listing) => sum + listing.views, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{listings.reduce((sum, listing) => sum + listing.bookings, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftListings.length})</TabsTrigger>
          <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                <p className="text-muted-foreground mb-4">Start earning by listing your first item</p>
                <Button asChild>
                  <Link href="/list-item">List Your First Item</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          {draftListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Edit className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No draft listings</h3>
                <p className="text-muted-foreground">All your listings are published and active</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
