"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Star, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"

interface Rental {
  id: string
  title: string
  price: number
  location: string
  image: string
  status: "active" | "pending" | "completed" | "cancelled"
  startDate: string
  endDate: string
  renterName: string
  renterAvatar: string
}

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState("active")

  const rentals: Rental[] = [
    {
      id: "1",
      title: "Professional Camera Kit",
      price: 75,
      location: "Casablanca, MA",
      image: "/vintage-camera-still-life.png",
      status: "active",
      startDate: "2024-01-15",
      endDate: "2024-01-17",
      renterName: "Ahmed Benali",
      renterAvatar: "/defult-profile.jpeg",
    },
    {
      id: "2",
      title: "Mountain Bike",
      price: 45,
      location: "Rabat, MA",
      image: "/mountain-bike-trail.png",
      status: "pending",
      startDate: "2024-01-20",
      endDate: "2024-01-22",
      renterName: "Fatima Zahra",
      renterAvatar: "/defult-profile.jpeg",
    },
    {
      id: "3",
      title: "Bluetooth Speaker",
      price: 25,
      location: "Marrakech, MA",
      image: "/bluetooth-speaker.png",
      status: "completed",
      startDate: "2024-01-10",
      endDate: "2024-01-12",
      renterName: "Youssef Alami",
      renterAvatar: "/defult-profile.jpeg",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRentals = rentals.filter((rental) => {
    if (activeTab === "all") return true
    return rental.status === activeTab
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Rentals</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your rental bookings and history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredRentals.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  No {activeTab === "all" ? "" : activeTab} rentals found
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {activeTab === "all"
                    ? "You haven't made any rentals yet. Start browsing items to rent!"
                    : `You don't have any ${activeTab} rentals at the moment.`}
                </p>
                <Link href="/search">
                  <Button className="bg-primary hover:bg-primary/90">Browse Items</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredRentals.map((rental) => (
                  <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <img
                          src={rental.image || "/placeholder.svg"}
                          alt={rental.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{rental.title}</h3>
                              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{rental.location}</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(rental.status)}>
                              {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Rental Period</p>
                              <p className="font-medium">
                                {new Date(rental.startDate).toLocaleDateString()} -{" "}
                                {new Date(rental.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Total Price</p>
                              <p className="font-medium text-primary">{rental.price} MAD/day</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Renter</p>
                              <div className="flex items-center gap-2">
                                <img
                                  src={rental.renterAvatar || "/placeholder.svg"}
                                  alt={rental.renterName}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="font-medium">{rental.renterName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/item/${rental.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Item
                              </Button>
                            </Link>
                            <Link href="/chat">
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                            </Link>
                            {rental.status === "completed" && (
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
