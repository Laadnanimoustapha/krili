"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Calendar, DollarSign, Star, Check, Trash2 } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "booking" | "payment" | "review" | "system"
  title: string
  message: string
  time: string
  read: boolean
  avatar?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "message",
      title: "New message from Ahmed",
      message: "Hi, is the camera still available for this weekend?",
      time: "2 minutes ago",
      read: false,
      avatar: "/abstract-geometric-shapes.png",
    },
    {
      id: "2",
      type: "booking",
      title: "Booking confirmed",
      message: 'Your rental for "Professional Camera Kit" has been confirmed for Jan 15-17',
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      type: "payment",
      title: "Payment received",
      message: "You received $75 for renting your Mountain Bike",
      time: "3 hours ago",
      read: true,
    },
    {
      id: "4",
      type: "review",
      title: "New review received",
      message: "Fatima left a 5-star review for your Bluetooth Speaker",
      time: "1 day ago",
      read: true,
    },
    {
      id: "5",
      type: "system",
      title: "Profile verification complete",
      message: "Your identity verification has been approved. You can now rent premium items.",
      time: "2 days ago",
      read: true,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "booking":
        return <Calendar className="w-5 h-5 text-green-500" />
      case "payment":
        return <DollarSign className="w-5 h-5 text-yellow-500" />
      case "review":
        return <Star className="w-5 h-5 text-purple-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="booking">Bookings</TabsTrigger>
            <TabsTrigger value="payment">Payments</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${!notification.read ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar || "/placeholder.svg"}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{notification.time}</span>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {["message", "booking", "payment", "system"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              {notifications
                .filter((n) => n.type === type)
                .map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-200 ${!notification.read ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar || "/placeholder.svg"}
                              alt=""
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              {getIcon(notification.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  New
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{notification.time}</span>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
