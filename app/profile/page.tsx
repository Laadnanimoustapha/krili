"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Star,
  Edit,
  Trash2,
  Eye,
  X,
  Plus,
  RefreshCw,
  Download,
  ArrowUp,
  TrendingUp,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Award as IdCard,
  Phone,
  Mail,
  Key,
  Sun,
  Moon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Sample data
const profileData = {
  name: "Mohemed",
  avatar: "/defult-profile.jpeg",
  rating: 4.9,
  reviews: 120,
  location: "Casablanca, MA",
  bio: "Trusted renter and owner in Casablanca. I love sharing my items with the community and ensuring a great rental experience for everyone.",
  stats: {
    responseRate: "98%",
    avgResponse: "2h",
    totalRentals: "50+",
  },
  email: "john.doe@TAKHNAT.com",
}

const listingsData = [
  {
    id: 1,
    title: "MacBook Pro 2023",
    price: 500,
    location: "Casablanca, MA",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
    tags: ["Electronics", "Laptop", "Apple"],
  },
  {
    id: 2,
    title: "Honda CBR 600",
    price: 750,
    location: "Casablanca, MA",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80",
    tags: ["Vehicles", "Motorcycle", "Sport"],
  },
]

const rentalHistoryData = [
  {
    id: 1,
    title: "MacBook Pro 2023",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
    status: "active",
    dates: "Mar 15 - Mar 20, 2024",
    renter: "Sarah Johnson",
    amount: "2,500 MAD",
  },
  {
    id: 2,
    title: "Honda CBR 600",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80",
    status: "completed",
    dates: "Mar 10 - Mar 12, 2024",
    renter: "Mike Smith",
    amount: "1,500 MAD",
  },
]

const earningsData = {
  totalEarnings: "15,750 MAD",
  trend: "+12%",
  activeRentals: 5,
  pendingReturns: 2,
  averageRating: 4.9,
  totalReviews: 120,
}

const verificationData = [
  { type: "ID Verification", icon: IdCard, status: "verified", date: "March 1, 2024" },
  { type: "Phone Verification", icon: Phone, status: "verified", date: "March 1, 2024" },
  { type: "Email Verification", icon: Mail, status: "verified", date: "March 1, 2024" },
]

const reviewsData = [
  {
    id: 1,
    reviewer: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
    rating: 5.0,
    date: "March 15, 2024",
    text: "Excellent experience renting from John! The MacBook Pro was in perfect condition and John was very responsive throughout the rental period. Would definitely rent again!",
  },
]

export default function ProfilePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Load theme and handle scroll
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme as "light" | "dark")
    document.body.setAttribute("data-theme", savedTheme)

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  // Action handlers
  const handleEditProfile = () => showNotification("Edit profile clicked", "info")
  const handleEditListing = (id: number) => showNotification(`Edit listing ${id} clicked`, "info")
  const handleDeleteListing = (id: number) => showNotification(`Delete listing ${id} clicked`, "info")
  const handleViewRentalDetails = (id: number) => showNotification(`View rental details ${id} clicked`, "info")
  const handleCancelRental = (id: number) => showNotification(`Cancel rental ${id} clicked`, "info")
  const handleLeaveReview = (id: number) => showNotification(`Leave review ${id} clicked`, "info")
  const handleAddNewListing = () => showNotification("Add new listing clicked", "info")
  const handleRefreshData = () => showNotification("Data refreshed", "success")
  const handleExportData = () => showNotification("Data exported", "success")
  const handleChangePassword = () => showNotification("Change password clicked", "info")
  const handleDeleteAccount = () => showNotification("Delete account clicked", "info")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.ico" alt="KRILI Logo" width={32} height={32} />
            <span className="font-bold text-xl">KRILI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="hover:text-primary transition-colors">
              Search
            </Link>
            <span className="text-primary font-medium">Profile</span>
          </nav>

          <Button variant="ghost" onClick={toggleTheme} className="gap-2">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="hidden sm:inline">Theme</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.name} />
                <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {profileData.rating} ({profileData.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
                <p className="text-muted-foreground mb-6 max-w-2xl">{profileData.bio}</p>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profileData.stats.responseRate}</div>
                    <div className="text-sm text-muted-foreground">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profileData.stats.avgResponse}</div>
                    <div className="text-sm text-muted-foreground">Avg. Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{profileData.stats.totalRentals}</div>
                    <div className="text-sm text-muted-foreground">Rentals</div>
                  </div>
                </div>

                <Button onClick={handleEditProfile} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Earnings</CardTitle>
                  <p className="text-sm text-muted-foreground">Last 30 Days</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">{earningsData.totalEarnings}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{earningsData.trend} from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active Rentals</CardTitle>
                  <p className="text-sm text-muted-foreground">Current</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">{earningsData.activeRentals}</div>
                  <p className="text-sm text-muted-foreground">{earningsData.pendingReturns} pending returns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Average Rating</CardTitle>
                  <p className="text-sm text-muted-foreground">All Time</p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-2">{earningsData.averageRating}</div>
                  <p className="text-sm text-muted-foreground">Based on {earningsData.totalReviews} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {verificationData.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.type}</h4>
                          <p className="text-sm text-muted-foreground">Verified on {item.date}</p>
                          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button onClick={handleAddNewListing} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Listing
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsData.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={listing.image || "/placeholder.svg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                    <div className="text-2xl font-bold text-primary mb-2">{listing.price} MAD/day</div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {listing.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditListing(listing.id)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals" className="space-y-6">
            <h2 className="text-2xl font-bold">Rental History</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {rentalHistoryData.map((rental) => (
                <Card key={rental.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={rental.image || "/placeholder.svg"}
                          alt={rental.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{rental.title}</h3>
                          <Badge variant={rental.status === "active" ? "default" : "secondary"}>
                            {rental.status === "active" ? "Active" : "Completed"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{rental.dates}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Rented by {rental.renter}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{rental.amount}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRentalDetails(rental.id)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                      {rental.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelRental(rental.id)}
                          className="gap-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveReview(rental.id)}
                          className="gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <h2 className="text-2xl font-bold">Earnings Overview</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Earnings</CardTitle>
                  <p className="text-sm text-muted-foreground">Last 30 Days</p>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{earningsData.totalEarnings}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{earningsData.trend} from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Rentals</CardTitle>
                  <p className="text-sm text-muted-foreground">Current</p>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{earningsData.activeRentals}</div>
                  <p className="text-sm text-muted-foreground">{earningsData.pendingReturns} pending returns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Rating</CardTitle>
                  <p className="text-sm text-muted-foreground">All Time</p>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{earningsData.averageRating}</div>
                  <p className="text-sm text-muted-foreground">Based on {earningsData.totalReviews} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Analytics charts would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-bold">My Reviews</h2>

            <div className="space-y-4">
              {reviewsData.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} alt={review.reviewer.name} />
                          <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{review.reviewer.name}</h4>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{review.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email</span>
                  <span className="text-muted-foreground">{profileData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Change Password</span>
                  <Button variant="outline" size="sm" onClick={handleChangePassword} className="gap-2 bg-transparent">
                    <Key className="h-4 w-4" />
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email Notifications</span>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">In-App Notifications</span>
                  <Switch checked={inAppNotifications} onCheckedChange={setInAppNotifications} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <div
          className={`flex flex-col gap-2 mb-4 transition-all duration-300 ${showQuickActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          <Button size="icon" onClick={handleAddNewListing} title="Add New Listing">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleRefreshData} title="Refresh Data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleExportData} title="Export Data">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <Button size="icon" onClick={() => setShowQuickActions(!showQuickActions)} className="rounded-full">
          <Plus className={`h-4 w-4 transition-transform ${showQuickActions ? "rotate-45" : ""}`} />
        </Button>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button className="fixed bottom-8 left-8 z-50" size="icon" onClick={scrollToTop}>
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

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
